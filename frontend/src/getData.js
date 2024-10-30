import React from "react";
import myData from "./data/IR323_3138.json";


export default function getData(nodes_array){
    let microservices = myData["microservices"];
    let nodes = [];
    let methods = {};
    
    for (let i=0; i<microservices.length;i++){
        let microservice = microservices[i];
        let nodeName = microservice["name"];
        // This if statement is used to filter nodes if a nodes_array 
        // has been inputted, and only uses nodes that are in the nodes_array
        if (nodes_array == undefined || nodes_array.includes(nodeName)){
            nodes.push({
                "nodeName": nodeName,
                "nodeType": "service"
            });

        }
        else{
            continue;
        }
        
        let controllers = microservice["controllers"];
        for (let i=0; i<controllers.length; i++){
            let controller = controllers[i];
            let functions = controller["methods"];
            for (let i=0; i<functions.length; i++){
                let method = functions[i];
                let methodName = method["name"];
                let parameters = method["parameters"];
                let returnType = method["returnType"];
                let url = method["url"];
                let http = method["httpMethod"];
                // Check if this method has a default annotation, then also add that url
                if ("default" in method["annotations"][0]["attributes"]){
                    let temp_url = method["annotations"][0]["attributes"]["default"];
                    methods[temp_url] = {
                        "microservice" : nodeName, 
                        "parameters": parameters,
                        "returnType": returnType,
                        "methodName": methodName,
                        "httpMethod": http,
                    }

                }
                methods[url] = {
                    "microservice" : nodeName, 
                    "parameters": parameters,
                    "returnType": returnType,
                    "methodName": methodName,
                    "httpMethod": http,
                }
               

        }
    }
   
}
console.log(methods);
let connections = [];
let links = [];
    // array can be controller or service
    function iterateThrough(array){
        for (let i=0; i<array.length; i++){
            let arr = array[i];
            let methodCalls = arr["methodCalls"];
            for (let i=0; i<methodCalls.length; i++){
                let methodCall = methodCalls[i];
                // This is calling another microservice if the methodCall 
                // has a url parameter defined
                if (!("url" in methodCall)){
                    continue;
                }
                
                let url = methodCall["url"];
                if (!(url in methods)){
                    continue;
                }
                
                let http = methodCall["httpMethod"];
                let className = methodCall["AdminOrderServiceImpl"];
                let calledFrom = methodCall["calledFrom"];
                let destination = methods[url]["microservice"];
                let source = methodCall["microserviceName"];
                let name = source.concat(" --> ", destination);
                let link = [methods[methodCall["calledFrom"]], methodCall["microserviceName"]]
                if (source != destination){
                    // Check if this connection is already in 
                    // connections array
                    if (!(connections.includes(name))){
                        connections.push(name);
                        links.push(
                            {
                                "source": source,
                                "target": destination,
                                "requests": [
                                  {
                                    "destinationUrl": url,
                                    "sourceMethod": calledFrom, 
                                    "className": className,
                                    "type": http,
                                    "argument": methods[url]["parameters"],
                                    "msReturn": methods[url]["returnType"],
                                  }
                                ],
                                "name": name
                              },
                        )
    
                    }
                    else{
                        // The index of this connection in the connections array
                        // is the same index in the links array. Find 
                        // the link based on the index of the name in 
                        // connections array and push a new object into 
                        // the "requests" parameter
                        links[connections.indexOf(name)]["requests"].push(
                            {
                                "sourceMethod": calledFrom, 
                                "destinationMethod": methodCall["name"],
                                "type": methods[url]["httpMethod"],
                                "argument": methods[url]["parameters"],
                                "msReturn": methods[url]["returnType"],
                              }
    
                        )
    
                    }
                } 
        }
    }
    

    }

for (let i=0; i<microservices.length;i++){
    let microservice = microservices[i];
    let nodeName = microservice["name"];
    if (!(nodes_array == undefined) && !(nodes_array.includes(nodeName))){
        continue;
    }
    let controllers = microservice["controllers"];
    let services = microservice["services"];
    iterateThrough(services);
    iterateThrough(controllers);
    
}
    return {
        "graphName": "msgraph",
        "nodes": nodes, 
        "links": links, 
        "gitCommitId": "0"
    };


}