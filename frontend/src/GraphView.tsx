import React, { useMemo } from "react";
import { Box } from "@mui/material";
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
  NodeObject
} from "react-force-graph-2d";
import { NODES, LINKS, EntityNode } from "./graphData";

interface GraphNode extends NodeObject, EntityNode {}

interface GraphLink extends LinkObject {
  source: string | GraphNode;
  target: string | GraphNode;
}

export const GraphView: React.FC = () => {
  const data = useMemo(
    () => ({
      nodes: NODES.map((n) => ({ ...n })),
      links: LINKS.map(
        (l) =>
          ({
            source: l.source,
            target: l.target,
            label: l.label
          } as GraphLink)
      )
    }),
    []
  );

  const nodeColor = (node: GraphNode) =>
    node.type === "company" ? "#90caf9" : "#f48fb1";

  const nodeCanvasObject = (
    nodeObj: NodeObject,
    ctx: CanvasRenderingContext2D,
    globalScale: number
  ) => {
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

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <ForceGraph2D
        graphData={data}
        nodeCanvasObject={nodeCanvasObject}
        nodePointerAreaPaint={nodeCanvasObject}
        linkColor={() => "rgba(255,255,255,0.2)"}
        linkWidth={1}
        backgroundColor="transparent"
      />
    </Box>
  );
};

export default GraphView;

