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
var db   = new neo4j.GraphDatabase('http://neo4j:go8tie@localhost:7474');


module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");

    // The main node definition - most things happen in here
    function Messages(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

	   // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // respond to inputs....
        this.on('input', function (msg) {
            console.log(msg.payload.id);
            var params = {
            	userid: parseInt(msg.payload.id)
            }
            
       		var query = 'MATCH (u:User)-[:CREATED]->(t:Thread)-[:`NEXT`*]->m WITH m,t MATCH (m)<-[:CREATED]-(u) WHERE ID(u)={userid} RETURN t,m,u';           
                
            db.query(query, params, function(err,results){
            	msg.payload = [];
            	
				if (err){
					console.log(err);
					node.error("ERROR1");
					node.send(msg);
					return;
				}
					
				msg.payload = results.map(function (result) {
					
					return {
						id: result['m']['data']['messageId'],
						threadId: result['t']['data']['threadId'],
						threadName: result['t']['data']['threadName'],
						authorName:  result['u']['data']['name'],
						body: result['m']['data']['body'],
						timestamp: result['m']['data']['timestamp']
					}
				});
		
				node.send(msg);
			 });        
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("get messages",Messages);

}
