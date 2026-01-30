from __future__ import annotations

import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yaml
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
        
        # Get source document URL: from Mention->Document first, else from event attributes
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
        if not source_url and ev.attributes:
            try:
                attrs = json.loads(ev.attributes)
                source_url = attrs.get("source_url") or attrs.get("url")
            except (json.JSONDecodeError, TypeError):
                pass

        item = {
            "id": ev.id,
            "type": ev.type,
            "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
            "recorded_at": ev.recorded_at.isoformat() if ev.recorded_at else None,
            "attributes": ev.attributes,
            "confidence": ev.confidence,
            "entities": entities,
            "source_url": source_url,
        }
        result.append(item)
        # #region agent log (first event only)
        if len(result) == 1:
            try:
                with open(Path("/home/xiongta/projects/AIscope/.cursor/debug.log"), "a") as f:
                    import json as _j
                    f.write(_j.dumps({"location": "main.py:list_events", "message": "first event payload", "data": {"id": item["id"], "keys": list(item.keys()), "has_attributes": item.get("attributes") is not None, "source_url": item.get("source_url")}, "timestamp": __import__("time").time() * 1000, "sessionId": "debug-session"}) + "\n")
            except Exception:
                pass
        # #endregion

    return result


class EntitySearchRequest(BaseModel):
    query: str


class EntitySearchResponse(BaseModel):
    id: str
    name: str
    type: str
    description: str | None = None
    founded: int | None = None
    founders: list[str] | None = None
    acquisitions: list[dict] | None = None  # [{acquired_by: str, date: str, amount: float}]
    related_events: list[dict] | None = None  # Recent events involving this entity


def _normalize(s: str) -> str:
    return " ".join(s.strip().lower().split())


_COMPANY_REGISTRY_CACHE: dict[str, dict] | None = None


def _load_company_registry() -> dict[str, dict]:
    """
    Load `data/companies.yaml` and build a lookup map from normalized names/aliases -> record.
    """
    global _COMPANY_REGISTRY_CACHE
    if _COMPANY_REGISTRY_CACHE is not None:
        return _COMPANY_REGISTRY_CACHE

    repo_root = Path(__file__).resolve().parents[1]
    registry_path = repo_root / "data" / "companies.yaml"
    if not registry_path.exists():
        _COMPANY_REGISTRY_CACHE = {}
        return _COMPANY_REGISTRY_CACHE

    with registry_path.open("r", encoding="utf-8") as f:
        raw = yaml.safe_load(f) or {}

    companies = raw.get("companies", []) or []
    lookup: dict[str, dict] = {}
    for rec in companies:
        name = rec.get("name")
        if not name:
            continue
        lookup[_normalize(name)] = rec
        for alias in rec.get("aliases", []) or []:
            if alias:
                lookup[_normalize(alias)] = rec

    _COMPANY_REGISTRY_CACHE = lookup
    return lookup


# Minimal curated people allowlist for search-add (extend as needed).
_PEOPLE_ALLOWLIST: dict[str, dict] = {
    _normalize("Sam Altman"): {
        "id": "sam_altman",
        "name": "Sam Altman",
        "type": "person",
        "aliases": ["Samuel Altman"],
    },
    _normalize("Dario Amodei"): {"id": "dario_amodei", "name": "Dario Amodei", "type": "person", "aliases": []},
    _normalize("Elon Musk"): {"id": "elon_musk", "name": "Elon Musk", "type": "person", "aliases": []},
    _normalize("Demis Hassabis"): {"id": "demis_hassabis", "name": "Demis Hassabis", "type": "person", "aliases": []},
    _normalize("Yann LeCun"): {"id": "yann_lecun", "name": "Yann LeCun", "type": "person", "aliases": ["Yann Lecun"]},
    _normalize("Geoffrey Hinton"): {"id": "geoffrey_hinton", "name": "Geoffrey Hinton", "type": "person", "aliases": []},
    _normalize("Ilya Sutskever"): {"id": "ilya_sutskever", "name": "Ilya Sutskever", "type": "person", "aliases": []},
    _normalize("Andrew Ng"): {"id": "andrew_ng", "name": "Andrew Ng", "type": "person", "aliases": []},
}


@app.post("/entities/search", response_model=EntitySearchResponse)
def search_and_add_entity(request: EntitySearchRequest, db: Session = Depends(get_db)):
    """
    Search for an AI company or person and add it to the database **only if it is recognized**
    in a curated registry (`data/companies.yaml` + a small people allowlist).

    This prevents polluting the graph with arbitrary user input.
    """
    query_raw = request.query.strip()
    query = _normalize(query_raw)
    if not query:
        raise HTTPException(status_code=400, detail="Query must not be empty")

    # Check if entity already exists (by name or external_id)
    company_registry = _load_company_registry()
    rec = company_registry.get(query)
    external_id = rec.get("id") if rec else None
    
    existing = None
    if external_id:
        # Try to find by external_id first
        existing = db.query(Entity).filter(Entity.external_id == external_id).first()
    
    if not existing:
        # Fallback to name search
        existing = (
            db.query(Entity)
            .filter(Entity.name.ilike(f"%{query_raw.strip()}%"))
            .first()
        )

    if existing:
        # Map database entity type to frontend type based on external_id
        frontend_type = "ai_product_company"  # default
        ext_id = existing.external_id or ""
        if ext_id in ["aws", "azure", "databricks", "snowflake", "huggingface", "scale", "coreweave", "deepinfra"]:
            frontend_type = "ai_infra_company"
        elif ext_id in ["nvidia", "amd", "intel"]:
            frontend_type = "chip_company"
        elif existing.type == "person":
            frontend_type = "individual"

        # Query acquisition events (where this entity was acquired)
        from backend.models.events import EventEntityRole, Mention
        from backend.models.documents import Document
        
        acquisition_events = (
            db.query(Event, EventEntityRole)
            .join(EventEntityRole, EventEntityRole.event_id == Event.id)
            .filter(EventEntityRole.entity_id == existing.id)
            .filter(Event.type == "acquisition")
            .filter(EventEntityRole.role.in_(["target", "acquired"]))
            .order_by(Event.occurred_at.desc().nullslast())
            .limit(5)
            .all()
        )
        
        acquisitions = []
        for ev, role in acquisition_events:
            # Find who acquired this entity
            acquirer_roles = (
                db.query(EventEntityRole, Entity)
                .join(Entity, EventEntityRole.entity_id == Entity.id)
                .filter(EventEntityRole.event_id == ev.id)
                .filter(EventEntityRole.role.in_(["acquirer", "acquired_by"]))
                .all()
            )
            
            attrs = {}
            if ev.attributes:
                try:
                    attrs = json.loads(ev.attributes)
                except:
                    pass
            
            for acq_role, acquirer_entity in acquirer_roles:
                acquisitions.append({
                    "acquired_by": acquirer_entity.name,
                    "date": ev.occurred_at.isoformat() if ev.occurred_at else None,
                    "amount_usd": attrs.get("amount_usd"),
                })
        
        # Get recent events involving this entity
        recent_events = (
            db.query(Event, EventEntityRole)
            .join(EventEntityRole, EventEntityRole.event_id == Event.id)
            .filter(EventEntityRole.entity_id == existing.id)
            .order_by(Event.occurred_at.desc().nullslast())
            .limit(5)
            .all()
        )
        
        related_events = []
        for ev, role in recent_events:
            attrs = {}
            if ev.attributes:
                try:
                    attrs = json.loads(ev.attributes)
                except:
                    pass
            
            related_events.append({
                "type": ev.type,
                "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
                "summary": attrs.get("summary"),
                "amount_usd": attrs.get("amount_usd"),
            })

        return EntitySearchResponse(
            id=existing.external_id or f"db_{existing.id}",
            name=existing.name,
            type=frontend_type,
            description=None,
            founded=None,
            founders=None,
            acquisitions=acquisitions if acquisitions else None,
            related_events=related_events if related_events else None,
        )

    # Only allow adding if the entity matches a known registry entry.
    # (company_registry already loaded above)
    rec = company_registry.get(query)
    if rec is not None:
        entity_type = rec.get("type") or "company"
        name = rec.get("name") or query_raw
        external_id = rec.get("id")
        aliases = rec.get("aliases") or []

        new_entity = Entity(
            name=name,
            type=entity_type,
            external_id=external_id,
            aliases=json.dumps(aliases) if aliases else None,
        )
        db.add(new_entity)
        db.commit()
        db.refresh(new_entity)

        # Map entity type to frontend type based on ID patterns
        frontend_type = "ai_product_company"  # default
        if external_id in ["aws", "azure", "databricks", "snowflake", "huggingface", "scale", "coreweave", "deepinfra"]:
            frontend_type = "ai_infra_company"
        elif external_id in ["nvidia", "amd", "intel"]:
            frontend_type = "chip_company"
        elif entity_type == "person":
            frontend_type = "individual"
        
        # Query for any existing events involving this new entity
        acquisition_events = (
            db.query(Event, EventEntityRole)
            .join(EventEntityRole, EventEntityRole.event_id == Event.id)
            .filter(EventEntityRole.entity_id == new_entity.id)
            .filter(Event.type == "acquisition")
            .filter(EventEntityRole.role.in_(["target", "acquired"]))
            .order_by(Event.occurred_at.desc().nullslast())
            .limit(5)
            .all()
        )
        
        acquisitions = []
        for ev, role in acquisition_events:
            acquirer_roles = (
                db.query(EventEntityRole, Entity)
                .join(Entity, EventEntityRole.entity_id == Entity.id)
                .filter(EventEntityRole.event_id == ev.id)
                .filter(EventEntityRole.role.in_(["acquirer", "acquired_by"]))
                .all()
            )
            
            attrs = {}
            if ev.attributes:
                try:
                    attrs = json.loads(ev.attributes)
                except:
                    pass
            
            for acq_role, acquirer_entity in acquirer_roles:
                acquisitions.append({
                    "acquired_by": acquirer_entity.name,
                    "date": ev.occurred_at.isoformat() if ev.occurred_at else None,
                    "amount_usd": attrs.get("amount_usd"),
                })
        
        recent_events = (
            db.query(Event, EventEntityRole)
            .join(EventEntityRole, EventEntityRole.event_id == Event.id)
            .filter(EventEntityRole.entity_id == new_entity.id)
            .order_by(Event.occurred_at.desc().nullslast())
            .limit(5)
            .all()
        )
        
        related_events = []
        for ev, role in recent_events:
            attrs = {}
            if ev.attributes:
                try:
                    attrs = json.loads(ev.attributes)
                except:
                    pass
            
            related_events.append({
                "type": ev.type,
                "occurred_at": ev.occurred_at.isoformat() if ev.occurred_at else None,
                "summary": attrs.get("summary"),
                "amount_usd": attrs.get("amount_usd"),
            })
        
        return EntitySearchResponse(
            id=external_id or f"db_{new_entity.id}",
            name=new_entity.name,
            type=frontend_type,
            description=None,
            founded=None,
            founders=None,
            acquisitions=acquisitions if acquisitions else None,
            related_events=related_events if related_events else None,
        )

    person_rec = _PEOPLE_ALLOWLIST.get(query)
    if person_rec is not None:
        new_entity = Entity(
            name=person_rec["name"],
            type="person",
            external_id=person_rec.get("id"),
            aliases=json.dumps(person_rec.get("aliases") or []) if person_rec.get("aliases") else None,
        )
        db.add(new_entity)
        db.commit()
        db.refresh(new_entity)

        return EntitySearchResponse(
            id=person_rec.get("id") or f"db_{new_entity.id}",
            name=new_entity.name,
            type="individual",
            description=None,
            founded=None,
            founders=None,
        )

    raise HTTPException(
        status_code=404,
        detail="Unknown entity. Add it to data/companies.yaml (or extend the people allowlist) to allow it.",
    )

