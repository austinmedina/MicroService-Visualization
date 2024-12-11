import React, { useEffect, useRef, useState } from "react";
import GraphWrapper from "./components/graph/GraphWrapper";
import GraphMenu from "./components/graphControlMenu/GraphMenu";
import Menu from "./components/graph/RightClickNodeMenu";
import { InfoBox } from "./components/graph/NodeInfoBox";
import GraphMode from "./components/graphMode/GraphMode";
import TimeSlider from "./components/graph/TimeSlider";
import ColorSelector from "./components/graphMode/VisualModeColorSelector";
import { setupAxios, setupLogger } from "./utils/axiosSetup";
import axios from "axios";
import TrackNodeMenu from "./components/TrackNodeMenu";
import FilterBox from "./page.js";
import { BrowserRouter, Router } from "react-router-dom";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import NewPage from "./node.js";

import getData from "./getData";
import compareChanges from "./getChanges.js";

import files from './data/input.json';

function App(data: any) {
    const graphRef = useRef();
    const [search, setSearch] = useState("");
    const [value, setValue] = useState(8);
    const [initCoords, setInitCoords] = useState(null);
    const [initRotation, setInitRotation] = useState(null);
    const [graphData, setGraphData] = useState<{ graphName: string; nodes: { nodeName: any; nodeType: string; }[]; links: any[]; gitCommitId: any; } | null>(null);
    const [is3d, setIs3d] = useState(true);
    const [antiPattern, setAntiPattern] = useState(false);
    const [selectedAntiPattern, setSelectedAntiPattern] = useState("none");
    const [max, setMax] = useState(6);
    const [color, setColor] = useState("dark-default");
    const ref = useRef<HTMLDivElement>(null);
    const [isDark, setIsDark] = useState(true);
    const [trackChanges, setTrackChanges] = useState(true);
    const [graphName, setGraphName] = useState("test");
    const [graphTimeline, setGraphTimeline] = useState<any[] | null>(null);
    const [currentInstance, setCurrentInstance] = useState<number>();
    const [defNodeColor, setDefNodeColor] = useState(false);
    const [trackNodes, setTrackNodes] = useState([]);
    const [focusNode, setFocusNode] = useState();

    // For using backend
    //useEffect(() => {
        //const getGraphLifespan = async () => {
            //const graphLifespan = await axios.get(`/graph/${graphName}`);
            //console.log(graphLifespan);
            //setGraphTimeline(graphLifespan.data);
            //setGraphData(graphLifespan.data[0] ?? null);
            //setCurrentInstance(0);
       // };

        //getGraphLifespan();
    //}, [graphName]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                let temp: any = [];
                for (const filePath of files["files"]) {
                    const fileResponse = await fetch(filePath);
                    const fileData = await fileResponse.json();
                    console.log(fileData);
                    // Call getData with the JSON content
                    // check if a commit with that id already in it? Runs twice for some reason
                    if (!temp.some((commit: any) => commit.commitID === fileData.commitID)) {
                        temp.push(fileData);
                    }
                }
                console.log(temp);
                return temp;
                // setCommits(temp);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        const getGraphLifespan = async () => {
            let commits = await fetchData();
            console.log(commits);
            setGraphTimeline(commits);     //HERE is how to manage the timeline
            setGraphData(getData(commits[0], undefined));
            setCurrentInstance(0);
        };

        getGraphLifespan();
    }, [graphName]);

    // For without the file as inputs of which commit to use
    // useEffect(() => {
    //     const getGraphLifespan = async () => {
    //         setGraphTimeline([commit1, commit2, commit3]);     //HERE is how to manage the timeline
    //         setGraphData(getData(commit1, undefined));
    //         setCurrentInstance(0);
    //     };

    //     getGraphLifespan();
    // }, [graphName]);


    if (typeof currentInstance == "undefined" || !graphTimeline) {
        //Ideally just return a prompt to upload a file or use some default file
        return null;
    }
    return (
       <BrowserRouter >
        <Routes>
          <Route path="/" element=  
          
        
        
        {<div
           
            className={`max-w-full min-h-screen max-h-screen overflow-clip ${
                isDark ? `bg-gray-900` : `bg-gray-100`
            }`}
            ref={ref}
        >
            {/* Upper left mode toggle */}
            <GraphMode
                value={value}
                setValue={setValue}
                antiPattern={antiPattern}
                setAntiPattern={setAntiPattern}
                selectedAntiPattern={selectedAntiPattern}
                setSelectedAntiPattern={setSelectedAntiPattern}
                graphData={graphData}
                currentInstance={currentInstance}
                graphTimeline={graphTimeline}
            />
            
            <FilterBox
                key={`${currentInstance}-${trackChanges}`}
                graphData={graphData} 
                currentInstance={currentInstance}
                graphTimeline={graphTimeline}
                trackChanges={trackChanges}
            ></FilterBox>
            
            {/* Graph Menu on upper right with buttons */}
            <GraphMenu
                graphRef={graphRef}
                search={search}
                setSearch={setSearch}
                value={value}
                setValue={setValue}
                graphData={graphData}
                setGraphData={setGraphData}
                initCoords={initCoords}
                initRotation={initRotation}
                is3d={is3d}
                setIs3d={setIs3d}
                isDark={isDark}
                setIsDark={setIsDark}
                trackChanges={trackChanges}
                setTrackChanges={setTrackChanges}
                antiPattern={antiPattern}
                selectedAntiPattern={selectedAntiPattern}
                currentInstance={currentInstance}
                graphTimeline={graphTimeline}
            />
            {/* Graph object itself, contained within a wrapper to toggle 2d-3d */}
            <GraphWrapper
                height={ref?.current?.clientHeight ?? 735}
                width={ref?.current?.clientWidth ?? 1710}
                search={search}
                threshold={value}
                graphRef={graphRef}
                graphData={graphData}
                setInitCoords={setInitCoords}
                setInitRotation={setInitRotation}
                is3d={is3d}
                antiPattern={antiPattern}
                colorMode={color}
                defNodeColor={defNodeColor}
                setDefNodeColor={setDefNodeColor}
                setGraphData={setGraphData}
                isDarkMode={isDark}
                selectedAntiPattern={selectedAntiPattern}
                trackNodes={trackNodes}
                focusNode={focusNode}
                trackChanges={trackChanges}
                endpointCalls={[]}
            />
            <Menu trackNodes={trackNodes} setTrackNodes={setTrackNodes} />

            {/* left click node pop up box */}
            <InfoBox
                graphData={graphData}
                focusNode={focusNode}
                setFocusNode={setFocusNode}
            />
            {/* Bottom left "color by" box */}
            {!antiPattern ? (
                <ColorSelector
                    value={value}
                    setValue={setValue}
                    color={color}
                    setColor={setColor}
                    isDarkMode={isDark}
                />
            ) : (
                <></>
            )}

            <div className="flex flex-row items-center justify-center w-full">
                {/* Timeline slider on bottom of the screen */}
                <TimeSlider
                    max={max}
                    setGraphData={setGraphData}
                    graphTimeline={graphTimeline}
                    currentInstance={currentInstance}
                    setCurrentInstance={setCurrentInstance}
                    setDefNodeColor={setDefNodeColor}
                    trackChanges={trackChanges}
                />
            </div>
            <TrackNodeMenu
                trackNodes={trackNodes}
                setTrackNodes={setTrackNodes}
                graphData={graphData}
                graphTimeline={graphTimeline}
                currentInstance={currentInstance}
            />
        </div>}
        /> 
        <Route path="/node" element={<NewPage/>}/>
        </Routes>
        </BrowserRouter>
    );
}


export default App;
