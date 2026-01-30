import React, { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import GraphView from "./GraphView";
import WeeklySidebar from "./WeeklySidebar";
import EntityModal from "./EntityModal";
import EventModal from "./EventModal";
import EdgeModal from "./EdgeModal";
import EntitySearchBox from "./EntitySearchBox";
import { EntityNode, EntityLink, NODES } from "./graphData";
import type { EventDto, EntitySearchResult } from "./types";

const App: React.FC = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedEntity, setSelectedEntity] = useState<EntityNode | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<EntityLink | null>(null);
  const [dynamicNodes, setDynamicNodes] = useState<EntityNode[]>([]);
  const [dynamicLinks, setDynamicLinks] = useState<EntityLink[]>([]);
  const [highlightNodeId, setHighlightNodeId] = useState<string | null>(null);
  const [zoomToNodeId, setZoomToNodeId] = useState<string | null>(null);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              AIscope
            </Typography>
            <Typography
              variant="body2"
              sx={{ ml: 2, color: "text.secondary", display: { xs: "none", md: "block" } }}
            >
              Fact graph of core AI entities
            </Typography>
          </Box>
          <Box sx={{ flex: 1, maxWidth: 400, display: { xs: "none", md: "block" } }}>
            <EntitySearchBox
              onEntityAdded={(entity) => {
                const newNode: EntityNode = {
                  id: entity.id,
                  label: entity.name,
                  type: entity.type as EntityNode["type"]
                };
                
                // Check if node already exists
                const existingNode = [...NODES, ...dynamicNodes].find(n => n.id === newNode.id);
                if (existingNode) {
                  // Node already exists, just zoom to it
                  setHighlightNodeId(newNode.id);
                  // Small delay to ensure graph is ready
                  setTimeout(() => {
                    setZoomToNodeId(newNode.id);
                  }, 50);
                  setSelectedEntity(newNode);
                  return;
                }
                
                // Add new node
                setDynamicNodes((prev) => [...prev, newNode]);
                
                // Create automatic edges based on entity type and known relationships
                const newLinks: EntityLink[] = [];
                
                // AI Product Companies -> NVIDIA (GPU provider)
                if (newNode.type === "ai_product_company") {
                  const nvidiaExists = [...NODES, ...dynamicNodes].find(n => n.id === "nvidia");
                  if (nvidiaExists) {
                    newLinks.push({
                      source: "nvidia",
                      target: newNode.id,
                      label: "GPU provider",
                      type: "infrastructure",
                      description: `NVIDIA provides GPUs for ${newNode.label}'s AI model training and inference.`
                    });
                  }
                }
                
                // Infrastructure companies -> AI Product Companies (if they're known partners)
                if (newNode.type === "ai_infra_company") {
                  const openaiExists = [...NODES, ...dynamicNodes].find(n => n.id === "openai");
                  if (openaiExists && (newNode.id.includes("aws") || newNode.id.includes("azure"))) {
                    newLinks.push({
                      source: newNode.id,
                      target: "openai",
                      label: "Cloud infrastructure",
                      type: "infrastructure",
                      description: `${newNode.label} provides cloud infrastructure for OpenAI.`
                    });
                  }
                }
                
                // Microsoft -> OpenAI (if Microsoft is added)
                if (newNode.id === "microsoft") {
                  const openaiExists = [...NODES, ...dynamicNodes].find(n => n.id === "openai");
                  if (openaiExists) {
                    newLinks.push({
                      source: "microsoft",
                      target: "openai",
                      label: "Strategic partner / investor",
                      type: "partnership",
                      description: "Microsoft has invested over $13B in OpenAI and provides Azure infrastructure."
                    });
                  }
                }
                
                // AWS -> Anthropic (if AWS is added)
                if (newNode.id === "aws") {
                  const anthropicExists = [...NODES, ...dynamicNodes].find(n => n.id === "anthropic");
                  if (anthropicExists) {
                    newLinks.push({
                      source: "aws",
                      target: "anthropic",
                      label: "Strategic partner / investor",
                      type: "partnership",
                      description: "AWS has invested $4B in Anthropic and provides cloud infrastructure."
                    });
                  }
                }
                
                if (newLinks.length > 0) {
                  setDynamicLinks((prev) => [...prev, ...newLinks]);
                }
                
                // Zoom to and highlight the newly added entity
                // Wait a bit longer for the graph to position the new node
                setTimeout(() => {
                  setHighlightNodeId(newNode.id);
                  setZoomToNodeId(newNode.id);
                }, 300);
                
                setSelectedEntity(newNode);
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          minHeight: 0
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            p: 2,
            background:
              "radial-gradient(circle at top left, #1f2937 0, #020617 55%, #000 100%)"
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 500, color: "text.secondary" }}
            >
              Core AI ecosystem graph
            </Typography>
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <EntitySearchBox
                onEntityAdded={(entity) => {
                  const newNode: EntityNode = {
                    id: entity.id,
                    label: entity.name,
                    type: entity.type as EntityNode["type"]
                  };
                  
                  const existingNode = [...NODES, ...dynamicNodes].find(n => n.id === newNode.id);
                  if (existingNode) {
                    setHighlightNodeId(newNode.id);
                    setTimeout(() => {
                      setZoomToNodeId(newNode.id);
                    }, 50);
                    setSelectedEntity(newNode);
                    return;
                  }
                  
                  setDynamicNodes((prev) => [...prev, newNode]);
                  setTimeout(() => {
                    setHighlightNodeId(newNode.id);
                    setZoomToNodeId(newNode.id);
                  }, 300);
                  setSelectedEntity(newNode);
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid rgba(148, 163, 184, 0.25)",
              height: isSmall ? "calc(100vh - 140px)" : "100%"
            }}
          >
            <GraphView
              onNodeClick={(node) => {
                setSelectedEntity(node);
                setHighlightNodeId(node.id);
              }}
              onEdgeClick={setSelectedEdge}
              dynamicNodes={dynamicNodes}
              dynamicLinks={dynamicLinks}
              highlightNodeId={highlightNodeId}
              zoomToNodeId={zoomToNodeId}
            />
          </Box>
        </Box>

        {!isSmall && (
          <WeeklySidebar
            anchor="right"
            onEventClick={setSelectedEvent}
          />
        )}
      </Box>

      {isSmall && (
        <Box sx={{ height: 260, borderTop: "1px solid rgba(148,163,184,0.25)" }}>
          <WeeklySidebar
            anchor="right"
            onEventClick={setSelectedEvent}
          />
        </Box>
      )}

      <EntityModal
        open={selectedEntity !== null}
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
      />

      <EventModal
        open={selectedEvent !== null}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      <EdgeModal
        open={selectedEdge !== null}
        edge={selectedEdge}
        onClose={() => setSelectedEdge(null)}
      />
    </Box>
  );
};

export default App;

