"""
Database migrations.
"""
import os
from app.infrastructure.db.sqlite_client import SQLiteClient


async def run_migrations(db_client: SQLiteClient):
    """
    Run database migrations.

    Args:
        db_client: SQLite client instance
    """
    # Read schema file
    schema_path = os.path.join(
        os.path.dirname(__file__),
        "schema.sql"
    )

    with open(schema_path, "r") as f:
        schema_sql = f.read()

    # Execute schema
    for statement in schema_sql.split(";"):
        statement = statement.strip()
        if statement:
            await db_client.execute(statement)

    await db_client.commit()
    print("✅ Database migrations completed")