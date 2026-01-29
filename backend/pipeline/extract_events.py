from __future__ import annotations

from backend.db.base import SessionLocal
from backend.llm.event_extractor import EventExtractor
from backend.models.documents import Document
from backend.models.entities import Entity
from backend.models.events import Event, Mention, EventEntityRole
from backend.schemas.events import ExtractedEvent


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


def persist_extracted_event(
    session, doc: Document, extracted: ExtractedEvent
) -> Event:
    event = Event(
        type=extracted.type,
        occurred_at=extracted.occurred_at,
        attributes=extracted.attributes.model_dump_json(),
        confidence=extracted.confidence,
    )
    session.add(event)
    session.flush()

    # Mentions and fact-centric event–entity roles
    for ent_ref in extracted.entities:
        entity = _get_or_create_entity(session, ent_ref.name, ent_ref.type)
        mention = Mention(
            document_id=doc.id,
            entity_id=entity.id,
            event_id=event.id,
            snippet=None,
        )
        session.add(mention)

        event_role = EventEntityRole(
            event_id=event.id,
            entity_id=entity.id,
            role=ent_ref.role,
        )
        session.add(event_role)

    return event


def run_extraction_for_unprocessed_documents(limit: int = 20) -> int:
    """Run event extraction for documents that do not yet have mentions."""
    session = SessionLocal()
    extractor = EventExtractor()
    created_events = 0

    try:
        subq = session.query(Mention.document_id).distinct().subquery()
        docs = (
            session.query(Document)
            .filter(~Document.id.in_(subq))
            .order_by(Document.fetched_at.desc())
            .limit(limit)
            .all()
        )

        for doc in docs:
            result = extractor.extract(doc.content, url=doc.url)
            for ev in result.events:
                persist_extracted_event(session, doc, ev)
                created_events += 1

        session.commit()
        return created_events
    finally:
        session.close()

