import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { EntityNode } from "./graphData";
import { EntitySearchResult, searchAndAddEntity } from "./api";

interface EntityModalProps {
  open: boolean;
  entity: EntityNode | null;
  onClose: () => void;
}

interface EntityInfo {
  description: string;
  founded?: number;
  founders?: string[];
  acquisitions?: Array<{
    acquired_by: string;
    date: string | null;
    amount_usd?: number | null;
  }>;
  related_events?: Array<{
    type: string;
    occurred_at: string | null;
    summary?: string | null;
    amount_usd?: number | null;
  }>;
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "ai_product_company":
      return "AI Product Company";
    case "ai_infra_company":
      return "AI Infrastructure";
    case "chip_company":
      return "Chip Company";
    case "ai_scholar":
      return "AI Scholar";
    case "individual":
      return "Individual";
    default:
      return type;
  }
};

const getChipColor = (
  type: string
): "primary" | "secondary" | "success" | "warning" | "info" => {
  switch (type) {
    case "ai_product_company":
      return "primary";
    case "ai_infra_company":
      return "success";
    case "chip_company":
      return "warning";
    case "ai_scholar":
      return "info";
    case "individual":
      return "secondary";
    default:
      return "primary";
  }
};

// Mock entity data - in production, fetch from backend
const ENTITY_DATA: Record<string, EntityInfo> = {
  // AI Product Companies
  openai: {
    description:
      "OpenAI is an AI research company focused on developing safe artificial general intelligence (AGI). Known for GPT models, DALL-E, and ChatGPT.",
    founded: 2015,
    founders: [
      "Sam Altman",
      "Elon Musk",
      "Greg Brockman",
      "Ilya Sutskever",
      "Wojciech Zaremba",
      "John Schulman"
    ]
  },
  anthropic: {
    description:
      "Anthropic is an AI safety startup building Claude, a large language model focused on helpfulness, harmlessness, and honesty.",
    founded: 2021,
    founders: [
      "Dario Amodei",
      "Daniela Amodei",
      "Tom Brown",
      "Chris Olah",
      "Sam McCandlish",
      "Jack Clarke",
      "Jared Kaplan"
    ]
  },
  xai: {
    description:
      "xAI is an AI company developing Grok, a conversational AI assistant integrated with X (formerly Twitter).",
    founded: 2023,
    founders: ["Elon Musk"]
  },
  "google-deepmind": {
    description:
      "Google DeepMind combines deep learning and reinforcement learning to solve complex problems, including AlphaGo and AlphaFold.",
    founded: 2010,
    founders: ["Demis Hassabis", "Shane Legg", "Mustafa Suleyman"]
  },
  "meta-ai": {
    description:
      "Meta AI develops AI technologies for Meta's platforms, including Llama open-source models and AI research.",
    founded: 2013,
    founders: ["Yann LeCun"]
  },
  mistral: {
    description:
      "Mistral AI is a European AI company building efficient open-source language models and enterprise AI solutions.",
    founded: 2023,
    founders: ["Arthur Mensch", "Guillaume Lample", "Timothée Lacroix"]
  },
  perplexity: {
    description:
      "Perplexity AI is an AI-powered search engine that provides conversational answers with citations.",
    founded: 2022,
    founders: ["Aravind Srinivas", "Denis Yarats", "Johnny Ho", "Andy Konwinski"]
  },
  characterai: {
    description:
      "Character.AI enables users to create and chat with AI-powered characters and personalities.",
    founded: 2021,
    founders: ["Noam Shazeer", "Daniel De Freitas"]
  },
  stability: {
    description:
      "Stability AI develops open-source AI models for image generation, including Stable Diffusion.",
    founded: 2020,
    founders: ["Emad Mostaque"]
  },
  adept: {
    description:
      "Adept AI builds AI agents that can use software tools and APIs to accomplish tasks autonomously.",
    founded: 2022,
    founders: ["David Luan", "Ashish Vaswani", "Niki Parmar"]
  },
  cohere: {
    description:
      "Cohere develops enterprise-focused language models and NLP APIs for businesses.",
    founded: 2019,
    founders: ["Aidan Gomez", "Nick Frosst", "Ivan Zhang"]
  },
  reka: {
    description:
      "Reka AI builds multimodal AI models capable of understanding text, images, and video.",
    founded: 2022,
    founders: ["Dani Yogatama", "Yi Tay"]
  },
  runway: {
    description:
      "Runway develops AI-powered creative tools for video generation, editing, and visual effects.",
    founded: 2018,
    founders: [
      "Cristóbal Valenzuela",
      "Alejandro Matamala",
      "Anastasis Germanidis"
    ]
  },
  folio: {
    description:
      "Figure AI develops humanoid robots powered by advanced AI for various applications.",
    founded: 2022,
    founders: ["Brett Adcock"]
  },
  microsoft: {
    description:
      "Microsoft develops AI products including Azure AI, Microsoft Copilot, and partners with OpenAI. Provides cloud infrastructure and AI services through Azure.",
    founded: 1975,
    founders: ["Bill Gates", "Paul Allen"]
  },
  // Chinese AI Companies
  baidu: {
    description:
      "Baidu is China's leading AI company, developing Ernie large language models, autonomous driving (Apollo), and AI cloud services.",
    founded: 2000,
    founders: ["Robin Li", "Eric Xu"]
  },
  alibaba: {
    description:
      "Alibaba Cloud develops Tongyi large language models and provides AI cloud services. Part of Alibaba Group, China's largest e-commerce and cloud company.",
    founded: 1999,
    founders: ["Jack Ma"]
  },
  tencent: {
    description:
      "Tencent develops Hunyuan AI models, AI for gaming and social platforms (WeChat), and cloud AI services. One of China's largest tech companies.",
    founded: 1998,
    founders: ["Ma Huateng", "Zhang Zhidong"]
  },
  bytedance: {
    description:
      "ByteDance develops AI for TikTok recommendation algorithms, video generation, and AI research. Parent company of TikTok and Douyin.",
    founded: 2012,
    founders: ["Zhang Yiming"]
  },
  sensetime: {
    description:
      "SenseTime is a leading Chinese AI company specializing in computer vision, autonomous driving, and facial recognition technology.",
    founded: 2014,
    founders: ["Xu Li", "Tang Xiaoou"]
  },
  iflytek: {
    description:
      "iFlytek is a Chinese AI company specializing in speech recognition, natural language processing, and voice AI technology.",
    founded: 1999,
    founders: ["Liu Qingfeng"]
  },
  manus: {
    description:
      "Manus is a Singapore-based AI startup that builds AI agents—autonomous systems that execute complex digital tasks. Originally founded in China in 2022, Manus was acquired by Meta in December 2025 for over $2B.",
    founded: 2022,
    founders: ["Founders from China (names not publicly disclosed)"],
    acquisitions: [
      {
        acquired_by: "Meta",
        date: "2025-12-29",
        amount_usd: 2_000_000_000
      }
    ]
  },
  // AI Infrastructure Companies
  aws: {
    description:
      "Amazon Web Services (AWS) provides cloud AI infrastructure, Bedrock (managed LLM service), SageMaker (ML platform), and GPU instances for AI workloads.",
    founded: 2006,
    founders: ["Amazon"]
  },
  azure: {
    description:
      "Azure AI provides cloud infrastructure, managed AI services, and GPU instances. Microsoft's cloud AI platform powering OpenAI, Mistral, and other AI companies.",
    founded: 2010,
    founders: ["Microsoft"]
  },
  databricks: {
    description:
      "Databricks provides a unified analytics platform for data engineering, machine learning, and AI workloads.",
    founded: 2013,
    founders: [
      "Ali Ghodsi",
      "Andy Konwinski",
      "Ion Stoica",
      "Matei Zaharia",
      "Patrick Wendell",
      "Reynold Xin"
    ]
  },
  snowflake: {
    description:
      "Snowflake is a cloud data platform enabling data warehousing, data lakes, and AI/ML workloads.",
    founded: 2012,
    founders: ["Benoit Dageville", "Thierry Cruanes", "Marcin Żukowski"]
  },
  huggingface: {
    description:
      "Hugging Face provides open-source tools and models for natural language processing and machine learning.",
    founded: 2016,
    founders: ["Clément Delangue", "Julien Chaumond", "Thomas Wolf"]
  },
  scale: {
    description:
      "Scale AI provides data labeling, model evaluation, and AI infrastructure for enterprise AI development.",
    founded: 2016,
    founders: ["Alexandr Wang", "Lucy Guo"]
  },
  coreweave: {
    description:
      "CoreWeave provides high-performance cloud infrastructure optimized for AI and machine learning workloads.",
    founded: 2017,
    founders: ["Brian Venturo", "Michael Intrator"]
  },
  deepinfra: {
    description:
      "DeepInfra provides fast and cost-effective API access to open-source AI models.",
    founded: 2021,
    founders: ["Kevin Yang"]
  },
  // Chip Companies
  nvidia: {
    description:
      "NVIDIA is a leading chip company specializing in GPUs for AI and machine learning. Their CUDA platform and H100/A100 chips power most modern AI training.",
    founded: 1993,
    founders: ["Jensen Huang", "Chris Malachowsky", "Curtis Priem"]
  },
  amd: {
    description:
      "AMD designs and manufactures CPUs and GPUs, including AI-optimized processors like the MI300 series for data centers.",
    founded: 1969,
    founders: ["Jerry Sanders"]
  },
  intel: {
    description:
      "Intel is a major chip manufacturer developing AI accelerators including Gaudi chips and neural processing units (NPUs).",
    founded: 1968,
    founders: ["Gordon Moore", "Robert Noyce"]
  },
  // AI Scholars
  "yann-lecun": {
    description:
      "Yann LeCun is a Turing Award winner, Chief AI Scientist at Meta, and pioneer of convolutional neural networks (CNNs).",
    founded: 1960
  },
  "geoffrey-hinton": {
    description:
      "Geoffrey Hinton is a Turing Award winner known as the 'Godfather of AI' for foundational work in deep learning and backpropagation.",
    founded: 1947
  },
  "ilya-sutskever": {
    description:
      "Ilya Sutskever is co-founder and Chief Scientist of OpenAI, key architect of GPT models and transformer architecture.",
    founded: 1985
  },
  "andrew-ng": {
    description:
      "Andrew Ng is a leading AI educator, co-founder of Coursera, and former head of Google Brain and Baidu AI.",
    founded: 1976
  },
  // Individuals
  "sam-altman": {
    description:
      "Sam Altman is the CEO and co-founder of OpenAI, previously president of Y Combinator.",
    founded: 1985
  },
  "dario-amodei": {
    description:
      "Dario Amodei is the CEO and co-founder of Anthropic, previously VP of Research at OpenAI.",
    founded: 1985
  },
  "elon-musk": {
    description:
      "Elon Musk is the founder of xAI, Tesla, SpaceX, and Neuralink, focused on AI safety and development.",
    founded: 1971
  },
  "demis-hassabis": {
    description:
      "Demis Hassabis is the CEO and co-founder of Google DeepMind, a leading AI researcher.",
    founded: 1976
  }
};

export const EntityModal: React.FC<EntityModalProps> = ({
  open,
  entity,
  onClose
}) => {
  const [searchData, setSearchData] = useState<EntitySearchResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch entity details from backend when modal opens
  useEffect(() => {
    if (open && entity) {
      setLoading(true);
      searchAndAddEntity(entity.label)
        .then((data) => {
          setSearchData(data);
        })
        .catch((err) => {
          console.error("Failed to fetch entity details:", err);
          setSearchData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSearchData(null);
    }
  }, [open, entity]);

  if (!entity) return null;

  const staticInfo = ENTITY_DATA[entity.id] || {
    description: `${entity.label} is a ${getTypeLabel(entity.type)} in the AI ecosystem.`
  };

  // Merge static info with search data (search data takes precedence for dynamic info)
  const info: EntityInfo = {
    description: searchData?.description || staticInfo.description,
    founded: searchData?.founded || staticInfo.founded,
    founders: searchData?.founders || staticInfo.founders,
    acquisitions: searchData?.acquisitions || staticInfo.acquisitions,
    related_events: searchData?.related_events || staticInfo.related_events,
  };

  const isCompany =
    entity.type === "ai_product_company" ||
    entity.type === "ai_infra_company" ||
    entity.type === "chip_company";
  const isPerson = entity.type === "individual" || entity.type === "ai_scholar";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "background.paper",
          backgroundImage: "none"
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">{entity.label}</Typography>
          <Chip
            label={getTypeLabel(entity.type)}
            size="small"
            color={getChipColor(entity.type)}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mt: 1, lineHeight: 1.7, mb: 2 }}>
          {info.description}
        </Typography>

        {(info.founded || info.founders) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {info.founded && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}
                  >
                    {isCompany ? "Founded" : isPerson ? "Born" : "Established"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {info.founded}
                  </Typography>
                </Box>
              )}
              {info.founders && info.founders.length > 0 && (
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: 0.5
                    }}
                  >
                    {info.founders.length === 1 ? "Founder" : "Founders"}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {info.founders.join(", ")}
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Acquisitions */}
        {info.acquisitions && info.acquisitions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Acquisitions
            </Typography>
            <List dense>
              {info.acquisitions.map((acq, idx) => {
                const dateStr = acq.date
                  ? new Date(acq.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })
                  : null;
                return (
                  <ListItem key={idx} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            Acquired by {acq.acquired_by}
                          </Typography>
                          {acq.amount_usd && (
                            <Chip
                              label={`$${(acq.amount_usd / 1_000_000_000).toFixed(1)}B`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        dateStr && (
                          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5 }}>
                            {dateStr}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {/* Related Events */}
        {info.related_events && info.related_events.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Recent Events
            </Typography>
            <List dense>
              {info.related_events.map((ev, idx) => {
                const dateStr = ev.occurred_at
                  ? new Date(ev.occurred_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })
                  : null;
                return (
                  <ListItem key={idx} sx={{ px: 0 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Typography variant="body2" sx={{ textTransform: "capitalize", fontWeight: 500 }}>
                            {ev.type}
                          </Typography>
                          {ev.amount_usd && (
                            <Chip
                              label={`$${(ev.amount_usd / 1_000_000_000).toFixed(1)}B`}
                              size="small"
                              color="primary"
                            />
                          )}
                          {dateStr && (
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                              {dateStr}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        ev.summary && (
                          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                            {ev.summary}
                          </Typography>
                        )
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </>
        )}

        {loading && (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Loading entity details...
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityModal;
