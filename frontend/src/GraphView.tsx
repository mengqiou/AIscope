import React, { useMemo, useRef, useCallback, useState } from "react";
import { Box, Tooltip } from "@mui/material";
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject
} from "react-force-graph-2d";
import { NODES, LINKS, EntityNode, EntityLink } from "./graphData";

interface GraphNode extends NodeObject, EntityNode {}

interface GraphLink extends LinkObject {
  source: string | GraphNode;
  target: string | GraphNode;
  label?: string;
  type?: string;
  description?: string;
}

interface GraphViewProps {
  onNodeClick?: (node: EntityNode) => void;
  onEdgeClick?: (edge: EntityLink) => void;
}

const getNodeLabel = (node: string | GraphNode): string => {
  if (typeof node === "string") {
    const found = NODES.find((n) => n.id === node);
    return found?.label || node;
  }
  return node.label;
};

export const GraphView: React.FC<GraphViewProps> = ({ onNodeClick, onEdgeClick }) => {
  const [highlightedLink, setHighlightedLink] = useState<GraphLink | null>(null);

  const data = useMemo(
    () => ({
      nodes: NODES.map((n) => ({ ...n })),
      links: LINKS.map(
        (l) =>
          ({
            source: l.source,
            target: l.target,
            label: l.label,
            type: l.type,
            description: l.description
          } as GraphLink)
      )
    }),
    []
  );

  const nodeColor = (node: GraphNode) => {
    switch (node.type) {
      case "ai_product_company":
        return "#90caf9"; // Blue
      case "ai_infra_company":
        return "#81c784"; // Green
      case "chip_company":
        return "#ffb74d"; // Orange
      case "ai_scholar":
        return "#ba68c8"; // Purple
      case "individual":
        return "#f48fb1"; // Pink
      default:
        return "#90caf9";
    }
  };

  const nodeCanvasObject = (
    nodeObj: NodeObject,
    ctx: CanvasRenderingContext2D | null,
    globalScale: number
  ) => {
    if (!ctx || typeof ctx.beginPath !== "function") return;
    
    const node = nodeObj as GraphNode;
    const label = node.label;
    const fontSize = 12 / globalScale;

    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, 6, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();

    if (!label) return;

    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(label, (node.x ?? 0) + 8, node.y ?? 0);
  };

  const handleNodeClick = useCallback(
    (nodeObj: NodeObject) => {
      const node = nodeObj as GraphNode;
      if (onNodeClick) {
        onNodeClick({
          id: node.id,
          label: node.label,
          type: node.type
        });
      }
    },
    [onNodeClick]
  );

  const handleLinkClick = useCallback(
    (linkObj: LinkObject) => {
      const link = linkObj as GraphLink;
      if (onEdgeClick) {
        const sourceId = typeof link.source === "string" ? link.source : link.source.id;
        const targetId = typeof link.target === "string" ? link.target : link.target.id;
        onEdgeClick({
          source: sourceId,
          target: targetId,
          label: link.label,
          type: link.type as any,
          description: link.description
        });
      }
    },
    [onEdgeClick]
  );

  const linkColor = useCallback(
    (link: LinkObject) => {
      const l = link as GraphLink;
      if (highlightedLink === l) {
        return "rgba(144, 202, 249, 0.8)"; // Highlighted: bright blue
      }
      return "rgba(255,255,255,0.2)"; // Default: dim white
    },
    [highlightedLink]
  );

  const linkWidth = useCallback(
    (link: LinkObject) => {
      const l = link as GraphLink;
      return highlightedLink === l ? 3 : 1;
    },
    [highlightedLink]
  );

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        graphData={data}
        nodeCanvasObject={nodeCanvasObject}
        onNodeClick={handleNodeClick}
        onLinkClick={handleLinkClick}
        onLinkHover={(link) => setHighlightedLink(link as GraphLink)}
        nodeLabel={(node: NodeObject) => {
          const n = node as GraphNode;
          const typeLabels: Record<string, string> = {
            ai_product_company: "AI Product Company",
            ai_infra_company: "AI Infrastructure",
            chip_company: "Chip Company",
            ai_scholar: "AI Scholar",
            individual: "Individual"
          };
          return `${n.label} - ${typeLabels[n.type] || n.type}`;
        }}
        linkLabel={(link: LinkObject) => {
          const l = link as GraphLink;
          return l.label || `${getNodeLabel(l.source)} → ${getNodeLabel(l.target)}`;
        }}
        linkColor={linkColor}
        linkWidth={linkWidth}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        backgroundColor="transparent"
      />
    </Box>
  );
};

export default GraphView;

