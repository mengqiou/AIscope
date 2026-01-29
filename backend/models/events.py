from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from backend.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(64), index=True)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    attributes: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON
    confidence: Mapped[float | None] = mapped_column(nullable=True)
    # When AIscope first recorded this fact (append-only ledger timestamp)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class Relationship(Base):
    __tablename__ = "relationships"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    type: Mapped[str] = mapped_column(String(64), index=True)
    from_entity_id: Mapped[int] = mapped_column(ForeignKey("entities.id"), index=True)
    to_entity_id: Mapped[int] = mapped_column(ForeignKey("entities.id"), index=True)
    event_id: Mapped[int | None] = mapped_column(
        ForeignKey("events.id"), nullable=True, index=True
    )


class Mention(Base):
    __tablename__ = "mentions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    document_id: Mapped[int] = mapped_column(ForeignKey("documents.id"), index=True)
    entity_id: Mapped[int | None] = mapped_column(ForeignKey("entities.id"), nullable=True)
    event_id: Mapped[int | None] = mapped_column(ForeignKey("events.id"), nullable=True)
    snippet: Mapped[str | None] = mapped_column(Text, nullable=True)


class EventEntityRole(Base):
    """
    Fact-centric relationship between an Entity and an Event.

    This is the relational equivalent of:
        (Entity)-[:ROLE]->(Event)

    Example roles: \"company\", \"investor\", \"acquirer\", \"target\".
    """

    __tablename__ = "event_entity_roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    entity_id: Mapped[int] = mapped_column(ForeignKey("entities.id"), index=True)
    role: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)


class EventNoveltyLabel(Base):
    """
    Append-only classification of an event's novelty.

    This models a *fact about our interpretation* of an event at a given time,
    not mutable state on the event itself.
    """

    __tablename__ = "event_novelty_labels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), index=True)
    label: Mapped[str] = mapped_column(String(32), index=True)  # e.g. "new", "repeat", "update"
    computed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

