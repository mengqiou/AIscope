from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.db.base import SessionLocal, init_db
from backend.models.briefings import Briefing
from backend.models.entities import Entity
from backend.models.events import Event, EventEntityRole


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app = FastAPI(title="AIscope API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/briefings/latest")
def get_latest_briefing(db: Session = Depends(get_db)):
    briefing = db.query(Briefing).order_by(Briefing.generated_at.desc()).first()
    if not briefing:
        raise HTTPException(status_code=404, detail="No briefing available")
    return {
        "id": briefing.id,
        "generated_at": briefing.generated_at,
        "content_markdown": briefing.content_markdown,
    }


@app.get("/companies")
def list_companies(db: Session = Depends(get_db)):
    entities = db.query(Entity).filter(Entity.type == "company").order_by(Entity.name).all()
    return [
        {
            "id": e.id,
            "name": e.name,
        }
        for e in entities
    ]


@app.get("/companies/{company_id}/events")
def company_events(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Entity).filter(Entity.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    events = (
        db.query(Event)
        .join(EventEntityRole, EventEntityRole.event_id == Event.id)
        .filter(EventEntityRole.entity_id == company_id)
        .order_by(Event.occurred_at.desc().nullslast())
        .limit(100)
        .all()
    )
    return [
        {
            "id": ev.id,
            "type": ev.type,
            "occurred_at": ev.occurred_at,
            "recorded_at": ev.recorded_at,
            "attributes": ev.attributes,
            "confidence": ev.confidence,
        }
        for ev in events
    ]


@app.get("/events")
def list_events(db: Session = Depends(get_db)):
    from backend.models.events import EventEntityRole
    from backend.models.entities import Entity
    
    events = (
        db.query(Event)
        .order_by(Event.occurred_at.desc().nullslast())
        .limit(200)
        .all()
    )
    
    result = []
    for ev in events:
        # Get entities involved in this event
        entity_roles = (
            db.query(EventEntityRole, Entity)
            .join(Entity, EventEntityRole.entity_id == Entity.id)
            .filter(EventEntityRole.event_id == ev.id)
            .all()
        )
        
        entities = [
            {
                "name": entity.name,
                "type": entity.type,
                "role": role.role,
            }
            for role, entity in entity_roles
        ]
        
        # Get source document URL if available
        from backend.models.events import Mention
        from backend.models.documents import Document
        mention = (
            db.query(Mention)
            .filter(Mention.event_id == ev.id)
            .first()
        )
        source_url = None
        if mention:
            doc = db.query(Document).filter(Document.id == mention.document_id).first()
            if doc:
                source_url = doc.url
        
        result.append({
            "id": ev.id,
            "type": ev.type,
            "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
            "recorded_at": ev.recorded_at.isoformat() if ev.recorded_at else None,
            "attributes": ev.attributes,
            "confidence": ev.confidence,
            "entities": entities,
            "source_url": source_url,
        })
    
    return result

