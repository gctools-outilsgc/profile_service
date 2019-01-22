// Handler for messages from different exchanges and keys

function msgHandler(msg, cb) {
    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    setTimeout(function(){
        console.log("Done [X]");
        cb(true);
    },3000);
}

module.exports = {
    msgHandler
};