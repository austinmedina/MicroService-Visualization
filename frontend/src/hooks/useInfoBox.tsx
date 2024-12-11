import { useEffect, useCallback, useState } from "react";
import { getNeighbors } from "../utils/GraphFunctions";

export const useInfoBox = (graphData: any, setFocusNode: any) => {
    const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
    const [show, setShow] = useState<boolean>(false);
    const [name, setName] = useState<string>();
    const [type, setType] = useState<string>();
    const [depends, setDepends] = useState<any[]>();
    const [dependencies, setDependencies] = useState<any[]>();
    const [patterns, setAntiPatterns] = useState<any[]>();
    let node;
    const [methods, setMethods] = useState<any[]>();
    const [source, setSource] = useState<String>();
    const [destination, setDestination] = useState<String>();

    const handleClick = useCallback(
        (event: any) => {
            setAntiPatterns([]); // Change later
            console.log(event);
            node = event.detail.node;
            // different popup for link
            if (node["nodeType"] == "link"){
                setAnchorPoint({ x: event.pageX, y: event.pageY });
                setName(node.name);
                setType("link");
                setFocusNode({
                    node: event.detail.node.source.nodeName,
                    neighbors: [node.target]
                });
                
                setDependencies([node]);
                setDepends([]);
                //setAntiPatterns(event.detail.node.patterns)
                setShow(true);
                if (node.source.nodeType == "microservice"){
                    setSource(node.source.nodeName);
                    setDestination(node.target.nodeName);

                }
                else{
                    setSource(node.source.microserviceName);
                    setDestination(node.target.microserviceName);

                }
                
            }
            else{
                if (node.nodeType != "microservice"){
                    setMethods(node.methods);
                    setSource(node.microserviceName)
                }
                setAnchorPoint({ x: event.pageX, y: event.pageY });
                setName(event.detail.node.nodeName);
                setType(event.detail.node.nodeType);

                let neighbors = getNeighbors(
                    event.detail.node,
                    graphData.nodes,
                    graphData.links
                );
                console.log(neighbors);
            
                const neighborNames = neighbors.nodes.map(
                (node: any) => node.nodeName
                );

                setFocusNode({
                node: event.detail.node.nodeName,
                    neighbors: neighborNames,
                });

                const dependsOn = neighbors.nodeLinks
                    .filter(
                        (link: any) =>
                            event.detail.node.nodeName === link.target.nodeName
                    )
                    .map((link: any) => link);
                const dependencies = neighbors.nodeLinks
                    .filter(
                        (link: any) =>
                            event.detail.node.nodeName === link.source.nodeName
                    )
                    .map((link: any) => link);
                console.log(dependsOn);
                console.log(dependencies);
                setDependencies(dependencies);
                setDepends(dependsOn);
                //setAntiPatterns(event.detail.node.patterns)
                setShow(true);

            }
            
        },
        [setShow, setAnchorPoint]
    );

    // const handleLClick = useCallback(
    //     () => (show ? setShow(false) : null),
    //     [show]
    // );

    useEffect(() => {
        if (!show) {
            setFocusNode(null);
        }
    }, [show]);

    useEffect(() => {
        document.addEventListener("nodeClick", handleClick);
        // document.addEventListener("click", handleLClick);
        return () => {
            document.removeEventListener("nodeClick", handleClick);
            // document.removeEventListener("click", handleLClick);
        };
    });

    return {
        anchorPoint,
        name,
        show,
        type,
        depends,
        setShow,
        dependencies,
        patterns,
        methods,
        source, 
        destination
    };
};
