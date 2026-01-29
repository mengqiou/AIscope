export type EntityNodeType = "company" | "person";

export interface EntityNode {
  id: string;
  label: string;
  type: EntityNodeType;
}

export interface EntityLink {
  source: string;
  target: string;
  label?: string;
}

// For now, we use a curated static list of ~20 key AI companies and a few people.
export const NODES: EntityNode[] = [
  { id: "openai", label: "OpenAI", type: "company" },
  { id: "anthropic", label: "Anthropic", type: "company" },
  { id: "xai", label: "xAI", type: "company" },
  { id: "google-deepmind", label: "Google DeepMind", type: "company" },
  { id: "meta-ai", label: "Meta AI", type: "company" },
  { id: "mistral", label: "Mistral AI", type: "company" },
  { id: "databricks", label: "Databricks", type: "company" },
  { id: "snowflake", label: "Snowflake", type: "company" },
  { id: "perplexity", label: "Perplexity AI", type: "company" },
  { id: "huggingface", label: "Hugging Face", type: "company" },
  { id: "characterai", label: "Character.AI", type: "company" },
  { id: "stability", label: "Stability AI", type: "company" },
  { id: "adept", label: "Adept AI", type: "company" },
  { id: "scale", label: "Scale AI", type: "company" },
  { id: "cohere", label: "Cohere", type: "company" },
  { id: "reka", label: "Reka AI", type: "company" },
  { id: "runway", label: "Runway", type: "company" },
  { id: "coreweave", label: "CoreWeave", type: "company" },
  { id: "folio", label: "Figure AI", type: "company" },
  { id: "deepinfra", label: "DeepInfra", type: "company" },
  // A few people nodes
  { id: "sam-altman", label: "Sam Altman", type: "person" },
  { id: "dario-amodei", label: "Dario Amodei", type: "person" },
  { id: "elon-musk", label: "Elon Musk", type: "person" },
  { id: "demis-hassabis", label: "Demis Hassabis", type: "person" }
];

export const LINKS: EntityLink[] = [
  { source: "sam-altman", target: "openai", label: "CEO / co-founder" },
  { source: "dario-amodei", target: "anthropic", label: "CEO / co-founder" },
  { source: "elon-musk", target: "xai", label: "Founder" },
  { source: "demis-hassabis", target: "google-deepmind", label: "CEO" },
  { source: "openai", target: "microsoft", label: "Strategic partner" }, // implicit external node
  { source: "mistral", target: "microsoft", label: "Partner" },
  { source: "mistral", target: "huggingface", label: "Models" },
  { source: "perplexity", target: "openai", label: "Models" },
  { source: "perplexity", target: "mistral", label: "Models" },
  { source: "databricks", target: "mistral", label: "Investment" },
  { source: "cohere", target: "oracle", label: "Partnership" },
  { source: "runway", target: "stability", label: "Gen video ecosystem" },
  { source: "scale", target: "openai", label: "Data / evals" },
  { source: "scale", target: "anthropic", label: "Data / evals" },
  { source: "coreweave", target: "mistral", label: "Compute" },
  { source: "coreweave", target: "runway", label: "Compute" }
];

