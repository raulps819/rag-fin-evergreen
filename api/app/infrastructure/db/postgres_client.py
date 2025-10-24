"""
PostgreSQL database client using asyncpg.
"""
import asyncpg
from typing import List, Dict, Any, Optional
from app.core.config import settings


class PostgresClient:
    """
    Async PostgreSQL client for database operations.
    """

    def __init__(self):
        self._pool: Optional[asyncpg.Pool] = None
        self._connection: Optional[asyncpg.Connection] = None

    async def connect(self):
        """Establish database connection pool."""
        if not self._pool:
            # Parse DATABASE_URL
            # Format: postgresql://user:password@host:port/database
            self._pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=2,
                max_size=10,
                command_timeout=60
            )

    async def disconnect(self):
        """Close database connection pool."""
        if self._pool:
            await self._pool.close()
            self._pool = None

    async def execute(self, query: str, *params) -> str:
        """
        Execute a single query (INSERT, UPDATE, DELETE).

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            Status message from PostgreSQL
        """
        if not self._pool:
            await self.connect()

        async with self._pool.acquire() as conn:
            return await conn.execute(query, *params)

    async def execute_many(self, query: str, params_list: List[tuple]) -> None:
        """
        Execute a query multiple times with different parameters.

        Args:
            query: SQL query
            params_list: List of parameter tuples
        """
        if not self._pool:
            await self.connect()

        async with self._pool.acquire() as conn:
            await conn.executemany(query, params_list)

    async def fetch_one(self, query: str, *params) -> Optional[Dict[str, Any]]:
        """
        Fetch a single row.

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            Dict representing the row, or None
        """
        if not self._pool:
            await self.connect()

        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(query, *params)
            return dict(row) if row else None

    async def fetch_all(self, query: str, *params) -> List[Dict[str, Any]]:
        """
        Fetch all rows.

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            List of dicts representing rows
        """
        if not self._pool:
            await self.connect()

        async with self._pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]

    async def commit(self):
        """
        Commit is automatic in asyncpg (autocommit mode).
        This method is kept for interface compatibility.
        """
        pass

    async def rollback(self):
        """
        Rollback is not needed in asyncpg with pool.
        This method is kept for interface compatibility.
        Transactions should use async with conn.transaction().
        """
        pass

    async def transaction(self):
        """
        Get a transaction context manager.

        Usage:
            async with db_client.transaction() as conn:
                await conn.execute("INSERT ...")
                await conn.execute("UPDATE ...")
        """
        if not self._pool:
            await self.connect()

        conn = await self._pool.acquire()
        return _TransactionContext(conn, self._pool)


class _TransactionContext:
    """Helper class for transaction context management."""

    def __init__(self, conn: asyncpg.Connection, pool: asyncpg.Pool):
        self.conn = conn
        self.pool = pool
        self.transaction = None

    async def __aenter__(self):
        self.transaction = self.conn.transaction()
        await self.transaction.start()
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            await self.transaction.rollback()
        else:
            await self.transaction.commit()

        await self.pool.release(self.conn)
