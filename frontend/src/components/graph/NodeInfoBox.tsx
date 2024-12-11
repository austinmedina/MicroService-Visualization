import React, { SetStateAction, useEffect, useState } from "react";
import { useInfoBox } from "../../hooks/useInfoBox";
import CollapsableBox from "../CollapsableBox";

type Props = {
    graphData: any;
    focusNode: any;
    setFocusNode: any;
    
};

export const InfoBox = (props: Props) => {
    const { anchorPoint, show, name, type, depends, setShow, dependencies, patterns, methods, source, destination} =
        useInfoBox(props.graphData, props.setFocusNode);

    const getColorClass = (color: string) => {
        switch (color) {
            case 'red':
            return 'bg-red-500';
            case 'green':
            return 'bg-green-500';
            case 'grey':
            return 'bg-gray-500';
            default:
            return 'bg-white'; // default background color
        }
    };
    
    // Popup for a link
    if (type == "link"){
        return (
            <ul
            className={`absolute flex-col top-[10%] left-[60%] bg-slate-200 bg-opacity-90 gap-2 rounded-lg p-4 max-h-96
                ${show ? `flex` : `hidden`}`}
            style={{ top: anchorPoint.y, left: anchorPoint.x }}
        >
            <p>Link: {name}</p>
            <p> Source microservice: {source}</p>
            <p> Destination microservice: {destination}</p>
            <div className="max-h-96 w-96 overflow-y-scroll dark-scrollbar">
                <ul className="list-disc list-inside my-2">
                    <div className="font-medium mb-2"></div>
                    {dependencies && dependencies.length > 0 ? (
                        dependencies.map((link: any) => (
                            <CollapsableBox
                                title= "Method Calls"
                                svg={arrowSvg}
                                body={
                                    link.requests &&
                                    link.requests.length > 0 ? (
                                        link.requests.map((func: any) => (
                                            <ul style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }} className={getColorClass(func.color)}>
                                                <li className="font-medium">
                                                    Source method: {func.sourceMethod}
                                                </li>
                                                {func.type && (
                                                 <>
                                                    <li className="font-medium">
                                                     HTTP method: {func.type}
                                                    </li>
                                                    <li className="font-medium">
                                                     URL: {func.destinationUrl}
                                                    </li>
                                                </>
                                            
                                            )}
                                                
                                                <li className="font-mono text-cyan-600">
                                                    return type: {func.msReturn}
                                                </li>
                                                <li className="font-light font-mono">
                                                    Destination method: {func.endpointFunction}
                                                </li>
                                                <li>arguments: {func.argument} </li>
                                                
                                            </ul>
                                        ))
                                    ) : (
                                        <div>None</div>
                                    )
                                }
                                initOpen={false}
                            />
                        ))
                    ) : (
                        <div>None</div>
                    )}
                </ul>
            </div>

            <button
                onClick={() => {
                    props.setFocusNode(null);
                    setShow(false);
                }}
                className="hover:font-bold font-medium hover:text-cyan-600"
            >
                Close Box
            </button>
        </ul>
            

        );
        
    }
    // check if type is not a microservice, which means it is a CONTROLLER, SERVICE, REPOSITORY, 
    // or ENTITY
    else if (type != "microservice"){
        // methods is not undefined if type is not a microservice and not a link
        return(
            <ul
            className={`absolute flex-col top-[10%] left-[60%] bg-slate-200 bg-opacity-90 gap-2 rounded-lg p-4 max-h-96
                ${show ? `flex` : `hidden`}`}
            style={{ top: anchorPoint.y, left: anchorPoint.x }}
        >
            <p>NodeName: {name}</p>
            <p>Type: {type}</p>
            <p>Microservice Name: {source}</p>
            <div className="max-h-96 w-96 overflow-y-scroll dark-scrollbar">
                <ul className="list-disc list-inside my-2">
                    <div className="font-medium mb-2">Methods:</div>
                    {methods && methods.length > 0 ? (
                       methods.map((method: any) => (
                            <CollapsableBox
                                title={method.name}
                                svg={arrowSvg}
                                body={
                                    method ? (
                                        <ul style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }} className="">
                                       
                                        {method.url && method.httpMethod && (
                                            <>
                                            <li className="font-medium">
                                                URL: {method.url}
                                            </li>
                                            <li className="font-medium">
                                                HTTP method: {method.httpMethod}
                                            </li>
                                            </>
                                            
                                        )}
                                        <li className="font-medium">
                                            Parameters: {JSON.stringify(method.parameters)}
                                        </li>

                                        <li className="font-mono text-cyan-600">
                                            return type: {method.returnType}
                                        </li>
                                                
                                        </ul>
                                        
                                    ) : (
                                        <div>None</div>
                                    )
                                }
                                initOpen={false}
                            />
                        ))
                    ) : (
                        <div>None</div>
                    )}
                </ul>
            </div>

            <button
                onClick={() => {
                    props.setFocusNode(null);
                    setShow(false);
                }}
                className="hover:font-bold font-medium hover:text-cyan-600"
            >
                Close Box
            </button>
        </ul>

        );

    }

    return (
        <ul
            className={`absolute flex-col top-[10%] left-[60%] bg-slate-200 bg-opacity-90 gap-2 rounded-lg p-4 max-h-96
                ${show ? `flex` : `hidden`}`}
            style={{ top: anchorPoint.y, left: anchorPoint.x }}
        >
            <p>Name: {name}</p>
            <p>Type: {type}</p>
            <div className="max-h-96 w-96 overflow-y-scroll dark-scrollbar">
                <ul className="list-disc list-inside my-2">
                    <div className="font-medium mb-2">Dependencies:</div>
                    {dependencies && dependencies.length > 0 ? (
                        dependencies.map((link: any) => (
                            <CollapsableBox
                                title={link.target.nodeName}
                                svg={arrowSvg}
                                body={
                                    link.requests &&
                                    link.requests.length > 0 ? (
                                        link.requests.map((func: any) => (
                                            <ul style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }} className="">
                                                Method Call:
                                                <li className="font-medium">
                                                    Source method: {func.sourceMethod}
                                                </li>
                                                <li className="font-medium">
                                                    HTTP method: {func.type}
                                                </li>
                                                <li className="font-mono text-cyan-600">
                                                    return type: {func.msReturn}
                                                </li>
                                                <li className="font-light font-mono">
                                                    Destination method: {func.endpointFunction}
                                                </li>
                                                <li>arguments: {func.argument} </li>
                                                
                                            </ul>
                                        ))
                                    ) : (
                                        <div>None</div>
                                    )
                                }
                                initOpen={false}
                            />
                        ))
                    ) : (
                        <div>None</div>
                    )}
                </ul>
                <ul className="list-disc list-inside">
                    <div className="font-medium my-2">Depends On:</div>
                    {depends && depends.length > 0 ? (
                        depends.map((link: any) => (
                            <CollapsableBox
                                title={link.source.nodeName}
                                svg={arrowSvg}
                                body={
                                    link.requests &&
                                    link.requests.length > 0 ? (
                                        link.requests.map((func: any) => (
                                            <ul style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '10px', borderRadius: '5px' }} className="">
                                                Method Call:
                                                <li className="font-medium">
                                                    Source method: {func.sourceMethod}
                                                </li>
                                                <li className="font-medium">
                                                    HTTP method: {func.type}
                                                </li>
                                                <li className="font-mono text-cyan-600">
                                                    return type: {func.msReturn}
                                                </li>
                                                <li className="font-light font-mono">
                                                    Destination method: {func.endpointFunction}
                                                </li>
                                                <li>arguments: {func.argument} </li>
                                                
                                            </ul>
                                        ))
                                    ) : (
                                        <div>None</div>
                                    )
                                }
                                initOpen={false}
                            />
                        ))
                    ) : (
                        <div>None</div>
                    )}
                </ul>
                <ul className="list-disc list-inside my-2">
                    <div className="font-medium mb-2">Anti-Patterns:</div>
                    {patterns && patterns.length > 0 ? (
                        patterns.map((pattern: any) => (
                            <CollapsableBox
                                title={pattern.type}
                                svg={arrowSvg}
                                body={
                                    <p>Threshold: {pattern.threshold}</p>
                                }
                                initOpen={false}
                            />
                        ))
                    ) : (
                        <div>None</div>
                    )}
                </ul>
            </div>

            <button
                onClick={() => {
                    props.setFocusNode(null);
                    setShow(false);
                }}
                className="hover:font-bold font-medium hover:text-cyan-600"
            >
                Close Box
            </button>
        </ul>
    );
};

const arrowSvg = (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="h-6 w-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
        />
    </svg>
);
