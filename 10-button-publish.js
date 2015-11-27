/**
 * Copyright tlodge
 *
 */

module.exports = function(RED) {

    "use strict";

    function ButtonPublish(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        //copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        this.on('input', function (msg) {
           //log the message...
           //node.send(msg);
        });

        this.on("close", function() {

        });
    }

    RED.nodes.registerType("publish", ButtonPublish);
}
