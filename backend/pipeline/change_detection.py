from __future__ import annotations

from datetime import datetime, timedelta
from typing import Iterable

from sqlalchemy import and_

from backend.db.base import SessionLocal
from backend.models.events import Event, EventNoveltyLabel


def _similar_events(session, event: Event, window_days: int = 7) -> Iterable[Event]:
    """
    Find events of the same type that occurred in a time window around the given event.
    This is a pure query over the event ledger; it does not mutate any state.
    """
    if not event.occurred_at:
        return []
    start = event.occurred_at - timedelta(days=window_days)
    end = event.occurred_at + timedelta(days=window_days)
    return (
        session.query(Event)
        .filter(Event.id != event.id)
        .filter(Event.type == event.type)
        .filter(Event.occurred_at >= start)
        .filter(Event.occurred_at <= end)
        .all()
    )


def _compute_novelty_label(session, event: Event) -> str:
    """
    Basic novelty heuristic:

    - If there are no similar events in the window -> \"new\"
    - If there is an earlier event of the same type in the window -> \"repeat\"
    - Otherwise -> \"update\"
    """
    similars = _similar_events(session, event)
    if not similars:
        return "new"

    earlier = [s for s in similars if s.recorded_at < event.recorded_at]
    return "repeat" if earlier else "update"


def label_novelty_for_recent_events(limit: int = 100) -> int:
    """
    Append novelty labels for recent events.

    This does NOT mutate the Event rows themselves. Instead, it records
    our interpretation as separate, time-stamped facts in EventNoveltyLabel.
    """
    session = SessionLocal()
    created_labels = 0
    try:
        events = (
            session.query(Event)
            .order_by(Event.recorded_at.desc())
            .limit(limit)
            .all()
        )

        now = datetime.utcnow()

        for ev in events:
            label = _compute_novelty_label(session, ev)
            novelty = EventNoveltyLabel(
                event_id=ev.id,
                label=label,
                computed_at=now,
            )
            session.add(novelty)
            created_labels += 1

        session.commit()
        return created_labels
    finally:
        session.close()

