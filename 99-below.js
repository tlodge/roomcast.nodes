/**
 * Copyright 2015 Tom Lodge
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

// If you use this as a template, update the copyright with your own name.

// Sample Node-RED node file

var neo4j = require('neo4j');
var db   = new neo4j.GraphDatabase('http://localhost:7474');

module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function AdjacentNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        //this.topic = n.topic;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this below doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        //var msg = {};
        
        //msg.payload = "Hello world !"

        // send out the message to the rest of the workspace.
        // ... this message will get sent at startup so you may not see it in a debug node.
        //this.send(msg);

        // respond to inputs....
        this.on('input', function (msg) {
            node.warn("Below saw a payload: " + msg.payload);
            
         //var query = "MATCH (n:`Button`) RETURN n LIMIT 25";

         	//var query = 'MATCH (a:Apartment) RETURN a'
            var query = 'MATCH (a:Apartment {name:"'+ msg.payload +'"})-[:`ABOVE`*]->(b)<-[:LIVES_IN]-(u:User) WHERE NOT b.name="' + msg.payload + '" RETURN DISTINCT u,b';
            
            db.query(query, function(err,results){
            	msg.payload = [];
            	
				if (err){
					node.error("ERROR1");
					node.send(msg);
					return;
				}

				
				
				msg.payload = results.map(function (result) {
					//node.warn(result['a'].id + " " + result['a']['data'].name)
					//node.warn(result['u']['data'].name);
					//node.warn(result['u'].id);
					//node.warn(result['b']['data'].name);
					console.log(result['a']['data']);
					//node.warn(JSON.stringify(result['a']));
					//node.warn({user:{name:result['u']['data'].name,id:result['u'].id}, apartment:{name:result['b']['data'].name, id:result['b'].id}});
					return {user:{name:result['u']['data'].name,id:result['u'].id}, apartment:{name:result['b']['data'].name, id:result['b'].id}};
				
					//return result['a']['data'];
				});
				
				
				 node.send(msg);
			 });
            
           
            // in this example just send it straight on... should process it here really
            
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("below",AdjacentNode);

}
