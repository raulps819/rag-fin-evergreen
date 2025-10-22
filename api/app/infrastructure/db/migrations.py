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

    # Remove comments and execute statements
    lines = []
    for line in schema_sql.split('\n'):
        # Remove inline comments
        if '--' in line:
            line = line.split('--')[0]
        line = line.strip()
        if line:
            lines.append(line)

    # Join and split by semicolon
    clean_sql = ' '.join(lines)

    for statement in clean_sql.split(";"):
        statement = statement.strip()
        if statement:
            await db_client.execute(statement)

    await db_client.commit()
    print("✅ Database migrations completed")