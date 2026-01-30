from __future__ import annotations

"""
Add the Manus acquisition event to the database.

Usage (from project root, with .venv activated):

    python -m backend.scripts.add_manus_acquisition
"""

import json
from datetime import datetime

from backend.db.base import SessionLocal, init_db
from backend.models.documents import Document
from backend.models.entities import Entity
from backend.models.events import Event, EventEntityRole, Mention


def _get_or_create_entity(session, name: str, type_: str, external_id: str | None = None) -> Entity:
    if external_id:
        existing = session.query(Entity).filter(Entity.external_id == external_id).first()
        if existing:
            return existing
    
    existing = (
        session.query(Entity)
        .filter(Entity.name == name)
        .filter(Entity.type == type_)
        .first()
    )
    if existing:
        return existing
    ent = Entity(name=name, type=type_, external_id=external_id)
    session.add(ent)
    session.flush()
    return ent


def main() -> None:
    init_db()
    session = SessionLocal()

    try:
        # Check if event already exists
        manus = _get_or_create_entity(session, "Manus", "company", "manus")
        meta = _get_or_create_entity(session, "Meta AI", "company", "meta-ai")
        
        # Check if acquisition event already exists
        existing_acq = (
            session.query(Event)
            .join(EventEntityRole, EventEntityRole.event_id == Event.id)
            .filter(EventEntityRole.entity_id == manus.id)
            .filter(Event.type == "acquisition")
            .first()
        )
        
        if existing_acq:
            print("Manus acquisition event already exists.")
            return

        # Create document
        doc = Document(
            url="https://www.reuters.com/world/china/meta-acquire-chinese-startup-manus-boost-advanced-ai-features-2025-12-29/",
            title="Meta acquires Manus AI for over $2B",
            source_name="Reuters",
            published_at=datetime(2025, 12, 29),
            fetched_at=datetime.utcnow(),
            content="Meta acquires Manus AI startup for over $2 billion to boost advanced AI capabilities.",
            content_hash="manus-acquisition-1",
        )
        session.add(doc)
        session.flush()

        # Create acquisition event
        acquisition_date = datetime(2025, 12, 29)
        ev = Event(
            type="acquisition",
            occurred_at=acquisition_date,
            attributes=json.dumps({
                "amount_usd": 2_000_000_000,
                "summary": "Meta acquired Manus AI for over $2B in December 2025. Manus builds AI agents for autonomous task execution and was originally founded in China in 2022 before relocating to Singapore.",
            }),
            confidence=0.95,
        )
        session.add(ev)
        session.flush()

        # Link entities to event
        # Manus as the target/acquired company
        session.add(
            EventEntityRole(
                event_id=ev.id,
                entity_id=manus.id,
                role="target",
            )
        )
        
        # Meta as the acquirer
        session.add(
            EventEntityRole(
                event_id=ev.id,
                entity_id=meta.id,
                role="acquirer",
            )
        )

        # Create mention linking document to event
        session.add(
            Mention(
                document_id=doc.id,
                entity_id=manus.id,
                event_id=ev.id,
                snippet=None,
            )
        )

        session.commit()
        print("Added Manus acquisition event: Meta acquired Manus for $2B in December 2025.")
    finally:
        session.close()


if __name__ == "__main__":
    main()
