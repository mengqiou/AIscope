import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider
} from "@mui/material";
import { EntityNode } from "./graphData";

interface EntityModalProps {
  open: boolean;
  entity: EntityNode | null;
  onClose: () => void;
}

interface EntityInfo {
  description: string;
  founded?: number;
  founders?: string[];
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
  // AI Infrastructure Companies
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
  if (!entity) return null;

  const info = ENTITY_DATA[entity.id] || {
    description: `${entity.label} is a ${getTypeLabel(entity.type)} in the AI ecosystem.`
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EntityModal;
