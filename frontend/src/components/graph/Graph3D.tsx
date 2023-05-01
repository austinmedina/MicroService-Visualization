import React, { useCallback, useEffect, useState } from "react";
import ForceGraph3D from "react-force-graph-3d";
import { ForceGraphProps as SharedProps } from "react-force-graph-2d";
import {
    getColor,
    getLinkColor,
    getLinkWidth,
    getNeighbors,
    getNodeOpacity,
    getSpriteColor,
    getVisibility,
    showNeighbors,
} from "../../utils/GraphFunctions";
import * as THREE from "three";
import SpriteText from "three-spritetext";

type Props = {
    width: number;
    height: number;
    search: string;
    threshold: number;
    sharedProps: SharedProps;
    graphRef: any;
    setInitCoords: any;
    setInitRotation: any;
    highCoupling: any;
    antiPattern: any;
    colorMode: any;
    defNodeColor: any;
    setDefNodeColor: any;
    setGraphData: any;
    isDarkMode: any;
    selectedAntiPattern: any;
    trackNodes: any;
};

const Graph: React.FC<Props> = ({
    width,
    height,
    sharedProps,
    search,
    threshold,
    graphRef,
    setInitCoords,
    setInitRotation,
    highCoupling,
    antiPattern,
    colorMode,
    defNodeColor,
    setDefNodeColor,
    setGraphData,
    isDarkMode,
    selectedAntiPattern,
    trackNodes,
}) => {
    const [highlightNodes, setHighlightNodes] = useState<Set<string>>(
        new Set()
    );
    const [highlightLinks, setHighlightLinks] = useState<Set<string>>(
        new Set()
    );
    const [hoverNode, setHoverNode] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);
    const [hideNodes, setHideNodes] = useState<any>(new Set());

    const handleNodeHover = (node: any) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (node) {
            highlightNodes.add(node.nodeName);
            setHoverNode(node.nodeName);
            const neighbors = getNeighbors(node, sharedProps.graphData?.links);
            neighbors.nodes.forEach((node: any) =>
                highlightNodes.add(node.nodeName)
            );
        }
        updateHighlight();
    };

    const handleLinkHover = (link: any) => {
        highlightNodes.clear();
        highlightLinks.clear();

        if (link) {
            highlightLinks.add(link.id);
            highlightNodes.add(link.source);
            highlightNodes.add(link.target);
        }

        updateHighlight();
    };

    const updateHighlight = () => {
        setHighlightNodes(highlightNodes);
        setHighlightLinks(highlightLinks);
        graphRef.current.refresh();
    };

    const handleNodeClick = useCallback(
        (node: any) => {
            if (node != null) {
                const distance = 100;
                const distRatio =
                    1 + distance / Math.hypot(node.x, node.y, node.z);
                if (graphRef.current) {
                    graphRef.current.cameraPosition(
                        {
                            x: node.x * distRatio,
                            y: node.y * distRatio,
                            z: node.z * distRatio,
                        },
                        node,
                        1500
                    );
                }
                const event = new CustomEvent("nodeClick", {
                    detail: { node: node },
                });
                document.dispatchEvent(event);
            }
        },
        [graphRef]
    );

    useEffect(() => {
        let { x, y, z } = graphRef.current.cameraPosition();

        setInitCoords({ x, y, z });
        setInitRotation(graphRef.current.camera().quaternion);
        graphRef.current.d3Force("charge").strength((node: any) => {
            return -220;
        });
        graphRef.current.d3Force("link").distance((link: any) => {
            return 60;
        });
    }, []);

    return (
        <ForceGraph3D
            ref={graphRef}
            graphData={sharedProps.graphData}
            nodeId={"nodeName"}
            width={width}
            height={height}
            nodeVisibility={(node) => getVisibility(node, hideNodes)}
            onNodeRightClick={(node: any) => {
                const event = new CustomEvent("nodecontextmenu", {
                    detail: {
                        node: node,
                        coords: graphRef.current.graph2ScreenCoords(
                            node.x,
                            node.y,
                            node.z
                        ),
                        graphData: sharedProps.graphData,
                        setHideNodes: setHideNodes,
                        setGraphData: setGraphData,
                    },
                });
                document.dispatchEvent(event);
            }}
            nodeThreeObject={(node) => {
                const nodes = new THREE.Mesh(
                    new THREE.SphereGeometry(5),
                    new THREE.MeshLambertMaterial({
                        transparent: true,
                        color: getColor(
                            node,
                            sharedProps.graphData,
                            threshold,
                            highlightNodes,
                            hoverNode,
                            defNodeColor,
                            setDefNodeColor,
                            highCoupling,
                            antiPattern,
                            colorMode,
                            selectedAntiPattern,
                            trackNodes
                        ),
                        opacity: getNodeOpacity(node, search),
                    })
                );
                // @ts-ignore
                const sprite = new SpriteText(node.nodeName);
                sprite.material.depthWrite = false; // make sprite background transparent
                sprite.color = getSpriteColor(
                    node,
                    search,
                    sharedProps.graphData,
                    threshold,
                    highlightNodes,
                    hoverNode,
                    defNodeColor,
                    setDefNodeColor,
                    highCoupling,
                    antiPattern,
                    colorMode,
                    selectedAntiPattern,
                    trackNodes
                ) as string;
                sprite.textHeight = 8;
                sprite.position.set(0, 10, 0);

                nodes.add(sprite);
                return nodes;
            }}
            nodeThreeObjectExtend={false}
            linkCurvature={(link) => {
                let test = false;
                sharedProps.graphData?.links.forEach((link2: any) => {
                    if (
                        link2.target === link.source &&
                        link2.source === link.target
                    ) {
                        test = true;
                    }
                });
                if (test) {
                    return 0.4;
                } else {
                    return 0;
                }
            }}
            linkDirectionalArrowLength={10}
            linkDirectionalArrowRelPos={sharedProps.linkDirectionalArrowRelPos}
            linkDirectionalArrowColor={(link) =>
                getLinkColor(
                    link,
                    search,
                    hoverNode,
                    antiPattern,
                    true,
                    selectedAntiPattern
                )
            }
            linkDirectionalParticles={(link: any) =>
                highlightLinks.has(link.id) ? 2 : 0
            }
            linkDirectionalParticleWidth={(link) => getLinkWidth(link, search)}
            linkColor={(link) =>
                getLinkColor(
                    link,
                    search,
                    hoverNode,
                    antiPattern,
                    true,
                    selectedAntiPattern
                )
            }
            onNodeDragEnd={(node) => {
                if (node.x && node.y && node.z) {
                    node.fx = node.x;
                    node.fy = node.y;
                    node.fz = node.z;
                }
            }}
            backgroundColor={"rgba(0,0,0,0)"}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            onLinkHover={handleLinkHover}
            linkWidth={(link) => getLinkWidth(link, search)}
        />
    );
};

export default Graph;
