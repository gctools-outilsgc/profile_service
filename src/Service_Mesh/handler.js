// Handler for messages from different exchanges and keys

function msgHandler(msg) {
    console.log(" [x] %s:'%s'", msg.fields.routingKey, msg.content.toString());
    return true;
}

module.exports = {
    msgHandler
};