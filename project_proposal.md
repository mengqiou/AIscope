

# AIscope — System Design Overview

## A Fact-Centric, Time-Aware AI System for Ecosystem-Level Insight

---

## 1. Project Summary

**AIscope** is a persistent AI system designed to help individuals understand what is *actually happening* in the AI startup ecosystem over time. Rather than acting as a news reader or summariser, AIscope maintains a **fact-centric, time-aware world model** that records real-world events and derives high-level insights from their evolution.

The core idea is simple:

> **Store what happened as immutable facts;
> derive meaning, trends, and “god-view” insights outside the knowledge base.**

---

## 2. Core Design Choices and Rationale

### 2.1 Graph as the Knowledge Base

**Design choice**
Use a **graph-based knowledge base** as the system’s persistent memory.

**Reasoning**

* The AI ecosystem is inherently **relational** (companies, people, capital, products).
* Insight depends on **connections and patterns**, not isolated documents.
* Graphs make relationships and paths first-class, rather than implicit.

The graph is **not** a document store or a RAG index. It is a structured representation of *what exists and what happened*.

---

### 2.2 Fact-Centric, Event-Sourced Model

**Design choice**
Store only **verifiable, timestamped events** in the graph.
Do **not** store interpretations, beliefs, or derived trends.

**Reasoning**

* Facts are auditable and stable.
* Interpretations change over time.
* Event sourcing preserves full history and enables time-travel queries.

Each event is immutable and append-only.
State is *reconstructed*, never overwritten.

---

### 2.3 Time Captured via Events, Not Mutable State

**Design choice**
Represent time exclusively through **event timestamps**.

**Reasoning**

* “State” (e.g. funding level, hiring intensity) is derived from event history.
* Avoids stale or inconsistent snapshots.
* Enables asking: *“What did we know at time T?”*

This aligns with well-established patterns in financial ledgers and distributed systems.

---

### 2.4 Separation of Memory and Intelligence

**Design choice**
Strictly separate:

* **Knowledge storage (Graph)**
  from
* **Reasoning and interpretation (Insight layer)**

**Reasoning**

* Prevents LLM hallucinations from polluting memory.
* Keeps the knowledge base trustworthy.
* Makes reasoning reproducible and debuggable.

LLMs parse facts *into* the graph and reason *over* the graph — never directly modify it.

---

## 3. High-Level Architecture

```
External World (News, Social, Blogs)
              ↓
        Ingestion Layer
              ↓
       Event Extraction (LLM)
              ↓
       Validation & Normalisation
              ↓
        Fact Graph (Events + Entities)
              ↓
        Change Detection Layer
              ↓
         Insight Generation
              ↓
          Daily Briefing
```

The **Fact Graph** is the single source of truth.

---

## 4. Architecture Layers and Responsibilities

### 4.1 Ingestion Layer

**Function**

* Collect new information from curated sources.
* Deduplicate and store raw text with metadata.

**Key properties**

* No reasoning.
* No summarisation.
* Raw data preserved for traceability.

**Output**

* Timestamped documents ready for extraction.

---

### 4.2 Event Extraction Layer (LLM-assisted)

**Function**

* Convert unstructured text into **structured event candidates**.

**Typical events**

* Funding rounds
* Acquisitions
* Executive hires
* Product or model launches
* Strategic partnerships

**Key properties**

* Schema-constrained output.
* Explicit uncertainty handling.
* No direct graph writes.

---

### 4.3 Validation & Normalisation Layer

**Function**

* Validate extracted events against predefined schemas.
* Reject ambiguous or malformed outputs.
* Normalise entity names and attributes.

**Reasoning**
This layer is the **gatekeeper** that protects the graph from hallucinations and noise.

---

### 4.4 Fact Graph (Knowledge Base)

**Function**

* Store immutable events and entities.
* Preserve relationships and timestamps.
* Serve as the system’s long-term memory.

**What it stores**

* Entities: companies, people, investors, products
* Events: what happened, when, and who was involved

**What it does NOT store**

* Trends
* Sentiment
* Strategic interpretations

---

### 4.5 Change Detection Layer

**Function**

* Analyse event sequences over time.
* Detect deltas, repetition, and acceleration.

**Examples**

* Increased funding frequency
* Clustered acquisitions
* Sustained hiring in a specific role

**Key property**

* Deterministic and reproducible.
* Reads from the graph, never writes to it.

---

### 4.6 Insight Generation Layer (LLM-assisted)

**Function**

* Translate detected changes into human-readable insights.
* Provide context and “why it matters” explanations.

**Key property**

* Grounded strictly in graph-derived evidence.
* No new facts introduced.

This is where the “god-view” perspective emerges safely.

---

### 4.7 Reporting Layer

**Function**

* Produce concise daily or weekly briefings.
* Limit output to high-signal insights.

**Typical output**

* 5–10 bullet points per day
* Each linked back to underlying events

---

## 5. Component Interaction Summary

| Component          | Reads From       | Writes To          |
| ------------------ | ---------------- | ------------------ |
| Ingestion          | External sources | Raw document store |
| Event Extraction   | Raw documents    | Candidate events   |
| Validation         | Candidate events | Fact graph         |
| Fact Graph         | —                | —                  |
| Change Detection   | Fact graph       | Change summaries   |
| Insight Generation | Change summaries | Reports            |
| Reporting          | Reports          | User               |

Data flow is **strictly one-directional**, preventing feedback corruption.

---

## 6. Why This Architecture Works

* **Trustworthy**: Facts are separated from interpretation.
* **Time-aware**: History is preserved, not overwritten.
* **Explainable**: Every insight traces back to concrete events.
* **Extensible**: New event types or lenses can be added without redesign.
* **Human-aligned**: Outputs match how humans consume insight, not raw data.

---

## 7. Final Design Principle (Summary)

> **AIscope models the AI ecosystem as a graph of immutable, timestamped facts, and derives high-level understanding by analysing how those facts evolve over time.**

This principle governs every architectural decision in the system.

