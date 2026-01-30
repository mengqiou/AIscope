export type EntityNodeType =
  | "ai_product_company"
  | "ai_infra_company"
  | "chip_company"
  | "ai_scholar"
  | "individual";

export interface EntityNode {
  id: string;
  label: string;
  type: EntityNodeType;
}

export interface EntityLink {
  source: string;
  target: string;
  label?: string;
  type?: "leadership" | "partnership" | "investment" | "infrastructure" | "product";
  description?: string;
}

// Categorized list of key AI ecosystem entities
export const NODES: EntityNode[] = [
  // AI Product Companies (build end-user AI products/models)
  { id: "openai", label: "OpenAI", type: "ai_product_company" },
  { id: "anthropic", label: "Anthropic", type: "ai_product_company" },
  { id: "xai", label: "xAI", type: "ai_product_company" },
  { id: "google-deepmind", label: "Google DeepMind", type: "ai_product_company" },
  { id: "meta-ai", label: "Meta AI", type: "ai_product_company" },
  { id: "mistral", label: "Mistral AI", type: "ai_product_company" },
  { id: "perplexity", label: "Perplexity AI", type: "ai_product_company" },
  { id: "characterai", label: "Character.AI", type: "ai_product_company" },
  { id: "stability", label: "Stability AI", type: "ai_product_company" },
  { id: "adept", label: "Adept AI", type: "ai_product_company" },
  { id: "cohere", label: "Cohere", type: "ai_product_company" },
  { id: "reka", label: "Reka AI", type: "ai_product_company" },
  { id: "runway", label: "Runway", type: "ai_product_company" },
  { id: "folio", label: "Figure AI", type: "ai_product_company" },
  { id: "microsoft", label: "Microsoft", type: "ai_product_company" },
  
  // Chinese AI Companies
  { id: "baidu", label: "Baidu", type: "ai_product_company" },
  { id: "alibaba", label: "Alibaba Cloud", type: "ai_product_company" },
  { id: "tencent", label: "Tencent", type: "ai_product_company" },
  { id: "bytedance", label: "ByteDance", type: "ai_product_company" },
  { id: "sensetime", label: "SenseTime", type: "ai_product_company" },
  { id: "iflytek", label: "iFlytek", type: "ai_product_company" },
  { id: "manus", label: "Manus", type: "ai_product_company" },
  
  // AI Infrastructure Companies (provide platforms, tools, compute)
  { id: "aws", label: "AWS", type: "ai_infra_company" },
  { id: "azure", label: "Azure AI", type: "ai_infra_company" },
  { id: "databricks", label: "Databricks", type: "ai_infra_company" },
  { id: "snowflake", label: "Snowflake", type: "ai_infra_company" },
  { id: "huggingface", label: "Hugging Face", type: "ai_infra_company" },
  { id: "scale", label: "Scale AI", type: "ai_infra_company" },
  { id: "coreweave", label: "CoreWeave", type: "ai_infra_company" },
  { id: "deepinfra", label: "DeepInfra", type: "ai_infra_company" },
  
  // Chip Companies (hardware for AI)
  { id: "nvidia", label: "NVIDIA", type: "chip_company" },
  { id: "amd", label: "AMD", type: "chip_company" },
  { id: "intel", label: "Intel", type: "chip_company" },
  
  // AI Scholars (researchers/academics)
  { id: "yann-lecun", label: "Yann LeCun", type: "ai_scholar" },
  { id: "geoffrey-hinton", label: "Geoffrey Hinton", type: "ai_scholar" },
  { id: "ilya-sutskever", label: "Ilya Sutskever", type: "ai_scholar" },
  { id: "andrew-ng", label: "Andrew Ng", type: "ai_scholar" },
  
  // Individuals (founders/executives)
  { id: "sam-altman", label: "Sam Altman", type: "individual" },
  { id: "dario-amodei", label: "Dario Amodei", type: "individual" },
  { id: "elon-musk", label: "Elon Musk", type: "individual" },
  { id: "demis-hassabis", label: "Demis Hassabis", type: "individual" }
];

export const LINKS: EntityLink[] = [
  // Leadership connections
  {
    source: "sam-altman",
    target: "openai",
    label: "CEO / co-founder",
    type: "leadership",
    description: "Sam Altman co-founded OpenAI in 2015 and serves as CEO, leading the company's mission to develop safe AGI."
  },
  {
    source: "dario-amodei",
    target: "anthropic",
    label: "CEO / co-founder",
    type: "leadership",
    description: "Dario Amodei co-founded Anthropic in 2021 and serves as CEO, focusing on AI safety and building Claude."
  },
  {
    source: "elon-musk",
    target: "xai",
    label: "Founder",
    type: "leadership",
    description: "Elon Musk founded xAI in 2023 to develop Grok, an AI assistant integrated with X (Twitter)."
  },
  {
    source: "demis-hassabis",
    target: "google-deepmind",
    label: "CEO",
    type: "leadership",
    description: "Demis Hassabis co-founded DeepMind in 2010 and serves as CEO, leading breakthrough AI research."
  },
  {
    source: "ilya-sutskever",
    target: "openai",
    label: "Co-founder / Chief Scientist",
    type: "leadership",
    description: "Ilya Sutskever co-founded OpenAI and serves as Chief Scientist, key architect of GPT models."
  },
  {
    source: "yann-lecun",
    target: "meta-ai",
    label: "Chief AI Scientist",
    type: "leadership",
    description: "Yann LeCun leads Meta AI research, developing open-source models like Llama."
  },
  
  // Product/Model relationships
  {
    source: "mistral",
    target: "huggingface",
    label: "Models",
    type: "product",
    description: "Mistral AI models are distributed through Hugging Face's open-source platform."
  },
  {
    source: "perplexity",
    target: "openai",
    label: "Models",
    type: "product",
    description: "Perplexity uses OpenAI's GPT models to power its AI search engine."
  },
  {
    source: "perplexity",
    target: "mistral",
    label: "Models",
    type: "product",
    description: "Perplexity integrates Mistral AI models alongside OpenAI for diverse AI capabilities."
  },
  {
    source: "runway",
    target: "stability",
    label: "Gen video ecosystem",
    type: "product",
    description: "Runway and Stability AI collaborate in the generative video and image AI ecosystem."
  },
  
  // Infrastructure relationships
  {
    source: "databricks",
    target: "mistral",
    label: "Investment",
    type: "investment",
    description: "Databricks invested in Mistral AI to support open-source AI model development."
  },
  {
    source: "scale",
    target: "openai",
    label: "Data / evals",
    type: "infrastructure",
    description: "Scale AI provides data labeling and model evaluation services for OpenAI."
  },
  {
    source: "scale",
    target: "anthropic",
    label: "Data / evals",
    type: "infrastructure",
    description: "Scale AI provides data labeling and model evaluation services for Anthropic."
  },
  {
    source: "coreweave",
    target: "mistral",
    label: "Compute",
    type: "infrastructure",
    description: "CoreWeave provides GPU cloud infrastructure for Mistral AI's model training."
  },
  {
    source: "coreweave",
    target: "runway",
    label: "Compute",
    type: "infrastructure",
    description: "CoreWeave provides GPU cloud infrastructure for Runway's video generation models."
  },
  {
    source: "huggingface",
    target: "openai",
    label: "Open source",
    type: "partnership",
    description: "Hugging Face hosts OpenAI's open-source models and provides tools for the community."
  },
  {
    source: "huggingface",
    target: "anthropic",
    label: "Open source",
    type: "partnership",
    description: "Hugging Face hosts Anthropic's open-source models and provides tools for the community."
  },
  {
    source: "snowflake",
    target: "mistral",
    label: "Partnership",
    type: "partnership",
    description: "Snowflake partners with Mistral AI to integrate AI capabilities into data platforms."
  },
  
  // Chip company relationships
  {
    source: "nvidia",
    target: "openai",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs (H100, A100) that power OpenAI's model training and inference."
  },
  {
    source: "nvidia",
    target: "anthropic",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs (H100, A100) that power Anthropic's Claude model training."
  },
  {
    source: "nvidia",
    target: "meta-ai",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs that power Meta AI's Llama model training and research."
  },
  {
    source: "nvidia",
    target: "google-deepmind",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs that power Google DeepMind's AI research and model training."
  },
  {
    source: "coreweave",
    target: "nvidia",
    label: "GPU infrastructure",
    type: "infrastructure",
    description: "CoreWeave builds cloud infrastructure using NVIDIA GPUs for AI workloads."
  },
  
  // Microsoft relationships
  {
    source: "microsoft",
    target: "openai",
    label: "Strategic partner / investor",
    type: "partnership",
    description: "Microsoft has invested over $13B in OpenAI and provides Azure infrastructure for GPT models. OpenAI powers Microsoft Copilot."
  },
  {
    source: "azure",
    target: "openai",
    label: "Cloud infrastructure",
    type: "infrastructure",
    description: "Azure provides cloud infrastructure for OpenAI's model training and inference."
  },
  {
    source: "microsoft",
    target: "mistral",
    label: "Strategic partner",
    type: "partnership",
    description: "Microsoft partners with Mistral AI, providing Azure infrastructure and integrating Mistral models into Azure AI."
  },
  {
    source: "azure",
    target: "mistral",
    label: "Cloud infrastructure",
    type: "infrastructure",
    description: "Azure provides cloud infrastructure for Mistral AI's models."
  },
  
  // AWS relationships
  {
    source: "aws",
    target: "anthropic",
    label: "Strategic partner / investor",
    type: "partnership",
    description: "AWS has invested $4B in Anthropic and provides cloud infrastructure. Anthropic's Claude models are available on AWS Bedrock."
  },
  {
    source: "aws",
    target: "stability",
    label: "Cloud infrastructure",
    type: "infrastructure",
    description: "AWS provides cloud infrastructure for Stability AI's model training and deployment."
  },
  {
    source: "aws",
    target: "cohere",
    label: "Cloud infrastructure",
    type: "infrastructure",
    description: "AWS provides cloud infrastructure for Cohere's language models, available on AWS Bedrock."
  },
  {
    source: "aws",
    target: "nvidia",
    label: "GPU infrastructure",
    type: "infrastructure",
    description: "AWS offers NVIDIA GPU instances (P4, P5) for AI workloads and model training."
  },
  
  // Chinese AI company relationships
  {
    source: "baidu",
    target: "nvidia",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs for Baidu's Ernie large language models and autonomous driving AI."
  },
  {
    source: "alibaba",
    target: "nvidia",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs for Alibaba Cloud's Tongyi large language models and cloud AI services."
  },
  {
    source: "tencent",
    target: "nvidia",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs for Tencent's Hunyuan AI models and cloud gaming AI."
  },
  {
    source: "bytedance",
    target: "nvidia",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs for ByteDance's AI research, TikTok recommendation algorithms, and video generation models."
  },
  {
    source: "sensetime",
    target: "nvidia",
    label: "GPU provider",
    type: "infrastructure",
    description: "NVIDIA provides GPUs for SenseTime's computer vision models and autonomous driving AI."
  },
  {
    source: "alibaba",
    target: "openai",
    label: "Partnership",
    type: "partnership",
    description: "Alibaba Cloud partners with OpenAI to provide AI services in China and integrate GPT models."
  },
  
  // Acquisition: Meta acquires Manus
  {
    source: "meta-ai",
    target: "manus",
    label: "Acquired",
    type: "partnership",
    description: "Meta acquired Manus AI for over $2B in December 2025. Manus builds AI agents for autonomous task execution."
  },
];

