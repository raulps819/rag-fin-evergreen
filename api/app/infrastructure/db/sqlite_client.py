"""
SQLite database client.
"""
import aiosqlite
from typing import List, Dict, Any, Optional
from app.core.config import settings


class SQLiteClient:
    """
    Async SQLite client for database operations.
    """

    def __init__(self):
        self._connection: Optional[aiosqlite.Connection] = None

    async def connect(self):
        """Establish database connection."""
        # Read DATABASE_URL dynamically to allow test overrides
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        self._connection = await aiosqlite.connect(db_path)
        self._connection.row_factory = aiosqlite.Row

    async def disconnect(self):
        """Close database connection."""
        if self._connection:
            await self._connection.close()
            self._connection = None

    async def execute(self, query: str, params: tuple = ()) -> aiosqlite.Cursor:
        """
        Execute a single query.

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            Cursor object
        """
        if not self._connection:
            await self.connect()
        return await self._connection.execute(query, params)

    async def execute_many(self, query: str, params_list: List[tuple]) -> None:
        """
        Execute a query multiple times with different parameters.

        Args:
            query: SQL query
            params_list: List of parameter tuples
        """
        if not self._connection:
            await self.connect()
        await self._connection.executemany(query, params_list)

    async def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
        """
        Fetch a single row.

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            Dict representing the row, or None
        """
        cursor = await self.execute(query, params)
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def fetch_all(self, query: str, params: tuple = ()) -> List[Dict[str, Any]]:
        """
        Fetch all rows.

        Args:
            query: SQL query
            params: Query parameters

        Returns:
            List of dicts representing rows
        """
        cursor = await self.execute(query, params)
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]

    async def commit(self):
        """Commit current transaction."""
        if self._connection:
            await self._connection.commit()

    async def rollback(self):
        """Rollback current transaction."""
        if self._connection:
            await self._connection.rollback()