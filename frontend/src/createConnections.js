import React from "react"


export default function filterNodes(myData, arrayOfNodes, linksArray){
    let microservices = myData["microservices"];
    let nodes = {};
    let nodesArr = [];
    let links = [];
    let connections = [];
    let microservicesColors = {};
    let endpointCalls = [];
    let colors = ['(230, 25, 75)', '(60, 180, 75)', '(121, 25, 255)', '(0, 130, 200)', 
        '(245, 130, 48)', '(145, 30, 180)', '(70, 240, 240)', '(240, 50, 230)', '(210, 245, 60)', 
        '(250, 190, 212)', '(0, 128, 128)', '(220, 190, 255)', '(170, 110, 40)', '(255, 250, 200)', 
        '(128, 0, 0)', '(170, 255, 195)', '(128, 128, 0)', '(255, 215, 180)', '(0, 0, 128)', 
        '(128, 128, 128)', '(255, 255, 255)', '(0, 0, 0)'];
    let colorIndex = 0;

    for (let i=0; i<linksArray.length; i++){
        let requests = linksArray[i]["requests"];
        for (let n=0; n<requests.length; n++){
            let source = requests[n]["className"];
            let destination = requests[n]["destinationclassName"];
            let sourceMethod = requests[n]["sourceMethod"]
            let destinationMethod = requests[n]["endpointFunction"]
            let link = source.concat(" --> ", destination); 
            let parameters = requests[n]["argument"];
            let index;
            if (!(connections.includes(link))){
                connections.push(link);
                endpointCalls.push(link);
                links.push(
                    {
                        "nodeType": "link",
                        "source": source,
                        "target": destination,
                        "sourceMicroservice": linksArray[i]["source"],
                        "destinationMicroservice": linksArray[i]["destination"],
                        "requests": [],
                        "name": link
                      })
                index = connections.length - 1;
            }
            else{
                index = connections.indexOf(link);
            }
            links[index]["requests"].push(
                {
                    "sourceMethod": sourceMethod,
                    "type": requests[n]["type"],
                    "endpointFunction": destinationMethod,
                    "argument": parameters,
                    "msReturn": requests[n]["msReturn"],
                    "destinationUrl": requests[n]["destinationUrl"]
                  }

            )
        }
    }
    


    // For each microservice, add each controller name, service name, repository name, 
    // and entity name first, and add their methods with their parameters and return types,
    // then iterate through each controller method call and service method call 
    // and see what calls they make to each other

    // addNames(arr). arr can be either service, repository, entities, or controller array. 
    // Add the name of this array to nodes. 
    function addNames(microserviceName, arr){
        for (let i=0; i<arr.length; i++){
            let name;
            // Each service should have an implemented type which we are
            // using to define its name, if not use its className
            if (arr[i]["implementedTypes"].length == 1){ 
                name = arr[i]["implementedTypes"][0];

            }
            else{
                name = arr[i]["name"];
            }
            let type = arr[i]["classRole"];
            let packageName = arr[i]["packageName"];
            // Dictionary with method names as keys and parameters and return type as values
            // This is used to check if methods exist and what there parameters and return vals are. 
            let nodeMethods = {}; 
            let methods = arr[i]["methods"];
            // Array to hold all methods that are in this service/controller/repository/entity
            let methodsArr = []; 
            for (let s=0; s<methods.length; s++){
                let method = methods[s];
                nodeMethods[method["name"]] = {
                    "parameters": method["parameters"],
                    "returnType": method["returnType"]

                }
                
                let methodToAdd = {
                    "name": method["name"],
                    "parameters": method["parameters"],
                    "returnType": method["returnType"],

                }
                // Add url and http method if it is a controller
                if (type == "CONTROLLER"){
                    methodToAdd["url"] = method["url"];
                    methodToAdd["httpMethod"] = method["httpMethod"];
                }
                methodsArr.push(methodToAdd);

            }
            

            nodes[name] = nodeMethods;
            nodesArr.push({
                "nodeName": name,
                "nodeType": type, 
                "microserviceName": microserviceName,
                "packageName": packageName,
                "color": colors[colorIndex],
                "methods": methodsArr,
            })
            
            //let methods = arr[i]["methods"];
            //for (let index=0; index<methods.length; index++){
                //let method = methods[index];
               // let parameterCount = method["paramaters"].length;
                //let args = []
               // let parameters = method["paramaters"];
                //for (let s=0; s<parameters.length;s++){
                 //   args.push(parameters[s]["name"]);
               // }
                
            //}


        }


    }
     // array can be controller or service. Iterate through the method calls of the 
     // array and see if the objectType of what is being called is in the nodes array, ie a 
     // service, controller, repository, or entity. 
    function addLinks(array){
        for (let i=0; i<array.length; i++){
            let source;
            if (array[i]["implementedTypes"].length == 1){ 
                source = array[i]["implementedTypes"][0];

            }
            else{
                source = array[i]["name"];
            }
            
            let methodCalls = array[i]["methodCalls"];
            for (let n=0; n<methodCalls.length; n++){
                let methodCall = methodCalls[n];
                let objectType = methodCall["objectType"];
                let link = source.concat(" => ", objectType);
                if (objectType in nodes && objectType != source){
                    let returnType = "None";
                    if (methodCall["name"] in  nodes[objectType]){
                        returnType = nodes[objectType][methodCall["name"]]["returnType"];
                    }
                    if (!(connections.includes(link))){
                        connections.push(link);
                        links.push(
                        {
                            "nodeType": "link",
                            "source": source,
                            "target": objectType,
                            "sourceMicroservice": methodCall["microserviceName"],
                            "destinationMicroservice": methodCall["microserviceName"],
                            "requests": [{
                                "sourceMethod": methodCall["calledFrom"],
                                "endpointFunction": methodCall["name"],
                                "argument": methodCall["parameterContents"],
                                "msReturn": returnType,
                            }
                                
                            ],
                            "name": link
                          },
                    )

                }
                else{
                    // The index of this connection in the connections array
                    // is the same index in the links array. Find 
                    // the link based on the index of the name in 
                    // connections array and push a new object into 
                    // the "requests" parameter
                    links[connections.indexOf(link)]["requests"].push(
                        {
                            "sourceMethod": methodCall["calledFrom"],
                            "endpointFunction": methodCall["name"],
                            "argument": methodCall["parameterContents"],
                            "msReturn": returnType,
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
        
        if (!(arrayOfNodes.includes(nodeName))){
            continue;
        }
        
        let entities = microservice["entities"];
        let controllers = microservice["controllers"];
        let services = microservice["services"];
        let repositories = microservice["repositories"];
       
        addNames(nodeName, repositories);
        addNames(nodeName, entities);
        addNames(nodeName, controllers);
        addNames(nodeName, services);
        addLinks(services);
        addLinks(controllers);
        microservicesColors[nodeName] = "rgb".concat(colors[colorIndex]);

       colorIndex++;
        
    }
    return [
        {
        "graphName": "msgraph",
        "nodes": nodesArr, 
        "links": links, 
        "gitCommitId": "0"
    }, 
    microservicesColors, 
    endpointCalls
];


}