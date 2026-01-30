import React, { useMemo, useRef, useCallback, useState, useEffect } from "react";
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
  dynamicNodes?: EntityNode[];
  dynamicLinks?: EntityLink[];
  highlightNodeId?: string | null;
  zoomToNodeId?: string | null;
}

const getNodeLabel = (
  node: string | GraphNode,
  allNodes: EntityNode[] = NODES
): string => {
  if (typeof node === "string") {
    const found = allNodes.find((n) => n.id === node);
    return found?.label || node;
  }
  return node.label;
};

export const GraphView: React.FC<GraphViewProps> = ({
  onNodeClick,
  onEdgeClick,
  dynamicNodes = [],
  dynamicLinks = [],
  highlightNodeId = null,
  zoomToNodeId = null
}) => {
  const [highlightedLink, setHighlightedLink] = useState<GraphLink | null>(null);
  const [highlightedNode, setHighlightedNode] = useState<GraphNode | null>(null);
  const fgRef = useRef<ForceGraphMethods>();

  const data = useMemo(
    () => {
      // Combine static nodes with dynamic nodes, avoiding duplicates
      const allNodes = [...NODES];
      const existingIds = new Set(NODES.map((n) => n.id));

      for (const dynNode of dynamicNodes) {
        if (!existingIds.has(dynNode.id)) {
          allNodes.push(dynNode);
          existingIds.add(dynNode.id);
        }
      }

      // Combine static links with dynamic links, avoiding duplicates
      const allLinks: EntityLink[] = [...LINKS];
      const linkKeys = new Set(
        LINKS.map((l) => `${l.source}-${l.target}`)
      );

      for (const dynLink of dynamicLinks) {
        const key = `${dynLink.source}-${dynLink.target}`;
        if (!linkKeys.has(key)) {
          allLinks.push(dynLink);
          linkKeys.add(key);
        }
      }

      return {
        nodes: allNodes.map((n) => ({ ...n })),
        links: allLinks.map(
          (l) =>
            ({
              source: l.source,
              target: l.target,
              label: l.label,
              type: l.type,
              description: l.description
            } as GraphLink)
        )
      };
    },
    [dynamicNodes, dynamicLinks]
  );

  // Track if we need to zoom
  const [pendingZoom, setPendingZoom] = useState<string | null>(null);

  // Zoom to node when zoomToNodeId changes
  useEffect(() => {
    if (zoomToNodeId) {
      setPendingZoom(zoomToNodeId);
    }
  }, [zoomToNodeId]);

  // Function to attempt zoom
  const attemptZoom = useCallback((nodeId: string) => {
    if (!fgRef.current || !nodeId) return false;
    
    const node = data.nodes.find((n) => n.id === nodeId);
    if (node && node.x !== undefined && node.y !== undefined && node.x !== null && node.y !== null) {
      // Calculate zoom level to fit the node nicely
      const distance = 150;
      const distRatio = 1 + distance / Math.hypot(node.x, node.y);
      
      // Zoom and center on the node
      fgRef.current.zoom(distRatio, 400);
      fgRef.current.centerAt(node.x, node.y, 400);
      setPendingZoom(null); // Clear pending zoom
      return true;
    }
    return false;
  }, [data.nodes]);

  // Handle graph tick to check if we can zoom
  const handleTick = useCallback(() => {
    if (pendingZoom) {
      attemptZoom(pendingZoom);
    }
  }, [pendingZoom, attemptZoom]);

  // Update highlighted node
  useEffect(() => {
    if (highlightNodeId) {
      const node = data.nodes.find((n) => n.id === highlightNodeId);
      setHighlightedNode(node as GraphNode || null);
    } else {
      setHighlightedNode(null);
    }
  }, [highlightNodeId, data.nodes]);

  const getBaseNodeColor = useCallback((nodeType: string) => {
    switch (nodeType) {
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
  }, []);

  const nodeColor = useCallback((node: GraphNode) => {
    const baseColor = getBaseNodeColor(node.type || "");
    
    // Subtle highlight: slightly brighter version of the base color
    if (highlightedNode && node.id === highlightedNode.id) {
      // Lighten the base color by 20% for a subtle highlight
      return baseColor; // We'll handle highlight via ring instead
    }
    
    return baseColor;
  }, [highlightedNode, getBaseNodeColor]);

  const nodeCanvasObject = (
    nodeObj: NodeObject,
    ctx: CanvasRenderingContext2D | null,
    globalScale: number
  ) => {
    if (!ctx || typeof ctx.beginPath !== "function") return;
    
    const node = nodeObj as GraphNode;
    const label = node.label;
    const fontSize = 12 / globalScale;
    const isHighlighted = highlightedNode && node.id === highlightedNode.id;
    const radius = isHighlighted ? 7 : 6; // Slightly larger when highlighted

    // Draw subtle highlight ring for highlighted node
    if (isHighlighted) {
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, radius + 2, 0, 2 * Math.PI, false);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)"; // Subtle white ring
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(node.x ?? 0, node.y ?? 0, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = nodeColor(node);
    ctx.fill();

    if (!label) return;

    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isHighlighted ? "rgba(255, 255, 255, 0.95)" : "#ffffff"; // Slightly brighter text when highlighted
    ctx.fillText(label, (node.x ?? 0) + radius + 2, node.y ?? 0);
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

  const handleNodeHover = useCallback(
    (node: NodeObject | null) => {
      setHighlightedNode(node as GraphNode | null);
    },
    []
  );

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={data}
        nodeCanvasObject={nodeCanvasObject}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onLinkClick={handleLinkClick}
        onLinkHover={(link) => setHighlightedLink(link as GraphLink)}
        onEngineStop={handleTick}
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
          const allNodes = [...NODES, ...dynamicNodes];
          return l.label || `${getNodeLabel(l.source, allNodes)} → ${getNodeLabel(l.target, allNodes)}`;
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

