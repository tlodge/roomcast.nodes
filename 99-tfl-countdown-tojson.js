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



module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    var moment = require('moment');

    // The main node definition - most things happen in here
    function TFLConverter(n) {

      // Create a RED node
      RED.nodes.createNode(this,n);

	    //copy "this" object in case we need it in context of callbacks of other functions.
      var node = this;

      // respond to inputs....
      this.on('input', function (msg) {
          //aggregate the data!
          var aggregates = {};

          msg.payload.split("\n").forEach(function(line,i){
            if (i > 0){ //not interested in the first line returned!
                var prediction = JSON.parse(line);
                aggregates[prediction[1]] = aggregates[prediction[1]] || {};
                aggregates[prediction[1]][prediction[2]] = aggregates[prediction[1]][prediction[2]] || [];
                aggregates[prediction[1]][prediction[2]].push(prediction[3]);
            }
          });

          var results = [].concat.apply([],Object.keys(aggregates).map(function(rootkey){
            return [].concat.apply([], Object.keys(aggregates[rootkey]).map(function(key){
               return {location:rootkey, route:key, ts:aggregates[rootkey][key].sort(function(a,b){return a < b ? -1 : a > b ? 1: 0}).map(function(ts){
                    return moment.duration(ts-Date.now()).humanize();
               }).join()}
            }));
          }));

          msg.payload = {data:results, success:true}
          node.send(msg);
			});


      this.on("close", function() {
          // Called when the node is shutdown - eg on redeploy.
          // Allows ports to be closed, connections dropped etc.
          // eg: node.client.disconnect();
      });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("tfl countdown to json",TFLConverter);
}
