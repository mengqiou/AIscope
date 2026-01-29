from __future__ import annotations

"""
Bootstrap a few sample entities and events so the frontend
has something to visualize, without calling Bedrock.

Usage (from project root, with .venv activated):

    python -m backend.scripts.bootstrap_sample_events
"""

import json
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

        # Create synthetic documents for each event
        docs = [
            Document(
                url="https://techcrunch.com/2025/01/openai-funding-round",
                title="OpenAI raises $2B in strategic funding",
                source_name="TechCrunch",
                published_at=now - timedelta(days=2),
                fetched_at=now,
                content="OpenAI raises $2B in strategic funding to accelerate AGI development.",
                content_hash="bootstrap-openai-1",
            ),
            Document(
                url="https://www.theinformation.com/articles/anthropic-funding",
                title="Anthropic closes $3B Series C",
                source_name="The Information",
                published_at=now - timedelta(days=5),
                fetched_at=now,
                content="Anthropic closes a $3B Series C funding round led by Amazon and Google.",
                content_hash="bootstrap-anthropic-1",
            ),
            Document(
                url="https://www.bloomberg.com/news/xai-funding",
                title="xAI secures $6B in Series B funding",
                source_name="Bloomberg",
                published_at=now - timedelta(days=8),
                fetched_at=now,
                content="xAI secures $6B in Series B funding, one of the largest AI funding rounds.",
                content_hash="bootstrap-xai-1",
            ),
        ]
        for doc in docs:
            session.add(doc)
        session.flush()

        # Create a few sample funding events with detailed information
        events_data = [
            (
                "funding",
                now - timedelta(days=2),
                openai,
                2000000000,
                "OpenAI raises $2B in strategic funding to accelerate AGI development. The round includes investments from Microsoft and other strategic partners, bringing total funding to over $13B. The capital will be used to scale infrastructure, expand research teams, and develop next-generation AI models.",
                "Series B",
            ),
            (
                "funding",
                now - timedelta(days=5),
                anthropic,
                3000000000,
                "Anthropic closes a $3B Series C funding round led by Amazon and Google. The investment will support scaling Claude's capabilities, expanding enterprise partnerships, and advancing AI safety research. Anthropic is now valued at over $18B.",
                "Series C",
            ),
            (
                "funding",
                now - timedelta(days=8),
                xai,
                6000000000,
                "xAI secures $6B in Series B funding, one of the largest AI funding rounds in history. Led by Fidelity and other investors, the capital will accelerate Grok development, infrastructure expansion, and integration with X (Twitter) platform. xAI aims to build AGI that is maximally beneficial to humanity.",
                "Series B",
            ),
        ]

        from backend.models.events import Mention
        
        for idx, (ev_type, occurred_at, company, amount, summary, round_type) in enumerate(events_data):
            ev = Event(
                type=ev_type,
                occurred_at=occurred_at,
                attributes=json.dumps({
                    "amount_usd": amount,
                    "summary": summary,
                    "round": round_type,
                }),
                confidence=0.9,
            )
            session.add(ev)
            session.flush()

            # Link event to entity
            session.add(
                EventEntityRole(
                    event_id=ev.id,
                    entity_id=company.id,
                    role="company",
                )
            )
            
            # Link event to document
            if idx < len(docs):
                session.add(
                    Mention(
                        document_id=docs[idx].id,
                        entity_id=company.id,
                        event_id=ev.id,
                        snippet=None,
                    )
                )

        session.commit()
        print("Bootstrapped sample entities and events.")
    finally:
        session.close()


if __name__ == "__main__":
    main()

