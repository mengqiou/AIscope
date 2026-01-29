from __future__ import annotations

"""
Small helper script to verify database connectivity and migrations.

Usage (from project root):

    python -m backend.scripts.test_db_connection

It will:
  - load settings (including AISCOPE_DATABASE_URL from .env)
  - initialize the schema (init_db)
  - run a trivial SELECT 1
"""

from sqlalchemy import text

from backend.db.base import SessionLocal, init_db


def main() -> None:
    # Create tables if they don't exist yet
    init_db()

    # Open a session and run a trivial query
    with SessionLocal() as session:
        session.execute(text("SELECT 1"))

    print("Database connectivity OK ✅")


if __name__ == "__main__":
    main()

