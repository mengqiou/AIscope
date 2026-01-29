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
import { EntityLink, NODES } from "./graphData";

interface EdgeModalProps {
  open: boolean;
  edge: EntityLink | null;
  onClose: () => void;
}

const getEdgeTypeLabel = (type?: string) => {
  switch (type) {
    case "leadership":
      return "Leadership";
    case "partnership":
      return "Partnership";
    case "investment":
      return "Investment";
    case "infrastructure":
      return "Infrastructure";
    case "product":
      return "Product";
    default:
      return "Relationship";
  }
};

const getChipColor = (
  type?: string
): "primary" | "secondary" | "success" | "warning" | "info" => {
  switch (type) {
    case "leadership":
      return "secondary";
    case "partnership":
      return "success";
    case "investment":
      return "warning";
    case "infrastructure":
      return "info";
    case "product":
      return "primary";
    default:
      return "primary";
  }
};

const getNodeLabel = (id: string): string => {
  const node = NODES.find((n) => n.id === id);
  return node?.label || id;
};

export const EdgeModal: React.FC<EdgeModalProps> = ({ open, edge, onClose }) => {
  if (!edge) return null;

  const sourceLabel = getNodeLabel(edge.source);
  const targetLabel = getNodeLabel(edge.target);

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="h6">
            {sourceLabel} → {targetLabel}
          </Typography>
          {edge.type && (
            <Chip
              label={getEdgeTypeLabel(edge.type)}
              size="small"
              color={getChipColor(edge.type)}
            />
          )}
        </Box>
      </DialogTitle>
      <DialogContent>
        {edge.label && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", mb: 0.5 }}>
              Relationship Type
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {edge.label}
            </Typography>
          </Box>
        )}

        {edge.description && (
          <>
            {edge.label && <Divider sx={{ my: 2 }} />}
            <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
              {edge.description}
            </Typography>
          </>
        )}

        {!edge.description && (
          <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
            No detailed description available for this relationship.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EdgeModal;
