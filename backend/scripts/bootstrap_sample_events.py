from __future__ import annotations

"""
Bootstrap a few sample entities and events so the frontend
has something to visualize, without calling Bedrock.

Usage (from project root, with .venv activated):

    python -m backend.scripts.bootstrap_sample_events
"""

from datetime import datetime, timedelta

from backend.db.base import SessionLocal, init_db
from backend.models.documents import Document
from backend.models.entities import Entity
from backend.models.events import Event, EventEntityRole


def _get_or_create_entity(session, name: str, type_: str) -> Entity:
    existing = (
        session.query(Entity)
        .filter(Entity.name == name)
        .filter(Entity.type == type_)
        .first()
    )
    if existing:
        return existing
    ent = Entity(name=name, type=type_)
    session.add(ent)
    session.flush()
    return ent


def main() -> None:
    init_db()
    session = SessionLocal()

    try:
        # If there are already events, don't duplicate.
        if session.query(Event).count() > 0:
            print("Events already exist; skipping bootstrap.")
            return

        now = datetime.utcnow()

        # Core companies
        openai = _get_or_create_entity(session, "OpenAI", "company")
        anthropic = _get_or_create_entity(session, "Anthropic", "company")
        xai = _get_or_create_entity(session, "xAI", "company")

        # Simple synthetic document
        doc = Document(
            url="https://example.com/bootstrap",
            title="Synthetic bootstrap events",
            source_name="bootstrap",
            published_at=now - timedelta(days=3),
            fetched_at=now,
            content="Synthetic bootstrap events for AIscope.",
            content_hash="bootstrap-1",
        )
        session.add(doc)
        session.flush()

        # Create a few sample funding events
        events_data = [
            (
                "funding",
                now - timedelta(days=2),
                openai,
                2000000000,
                "OpenAI raises $2B strategic funding.",
            ),
            (
                "funding",
                now - timedelta(days=5),
                anthropic,
                3000000000,
                "Anthropic closes $3B round to scale Claude.",
            ),
            (
                "funding",
                now - timedelta(days=8),
                xai,
                6000000000,
                "xAI secures $6B to build next-gen models.",
            ),
        ]

        for ev_type, occurred_at, company, amount, summary in events_data:
            ev = Event(
                type=ev_type,
                occurred_at=occurred_at,
                attributes={
                    "amount_usd": amount,
                    "summary": summary,
                }.__str__(),  # keep it simple; frontend only reads summary via JSON if possible
                confidence=0.9,
            )
            session.add(ev)
            session.flush()

            session.add(
                EventEntityRole(
                    event_id=ev.id,
                    entity_id=company.id,
                    role="company",
                )
            )

        session.commit()
        print("Bootstrapped sample entities and events.")
    finally:
        session.close()


if __name__ == "__main__":
    main()

