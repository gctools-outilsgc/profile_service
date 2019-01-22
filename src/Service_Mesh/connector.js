require("dotenv").config();
const config = require("../config");
const amqp = require("amqplib/callback_api");
const { msgHandler } = require("./handler");

// object to hold connection
var amqpConn = null;

const exchangesAndBindings = {
    account: ["user.new", "user.modification", "user.delete"],
    notification: ["app.viewed"],
};

function closeOnErr(err, ch) {
    if (!err) {
        return false;
    }
    // eslint-disable-next-line no-console
    console.error("[SMQ] error", err);
    ch.close();
    return true;
  }

function listenMessageQueue(exchange){

    var retryDelay = 5000;

    amqpConn.createChannel(function(err, ch) {

        ch.on("error", function(err) {
            // eslint-disable-next-line no-console
            console.error("[SMQ] channel error", err.message);
        });
        ch.on("close", function() {
            // eslint-disable-next-line no-console
            console.log("[SMQ] channel '" + exchange + "' closed");
            setTimeout(function() {
                listenMessageQueue(exchange); 
            },retryDelay);
        }); 
        ch.checkExchange(exchange, function(err, ok){
            if (ok) {
                console.log("The world is beautiful - '" + exchange + "' exists");

                ch.assertQueue("profile", {durable: true}, function(err, q) {
                    if (closeOnErr(err, ch)) {
                        return;
                    }
        
                    exchangesAndBindings[exchange].forEach(function(key) {
                        ch.bindQueue(q.queue, exchange, key);
                    });
        
                    ch.prefetch(1);
                    ch.consume(q.queue, function(msg) {
        
                        msgHandler(msg, function(ok) {
                            try {
                                if (ok) {
                                    ch.ack(msg);
                                } else {
                                    ch.reject(msg, true);
                                }                    
                            } catch (e) {
                                closeOnErr(e);
                            }
                        });
        
                    }, {noAck: false}); 
                });
            } else {
                console.log("Exchange '" + exchange + "' does not exists");
                retryDelay = retryDelay * 2;
                if (retryDelay >= 3601000){
                    retryDelay = 3600000;
                }
            }
        });                 
    });
}

// if the connection is closed or fails to be established at all, we will reconnect
function connectMessageQueue(){
  
    amqp.connect("amqp://" + process.env.MQ_USER + ":" + process.env.MQ_PASS + "@" + config.rabbitMQ.host +"?heartbeat=60", function(err, conn) {
        if (err) {
            // eslint-disable-next-line no-console
            console.error("[SMQ]", err.message);
            return setTimeout(connectMessageQueue, 5000);
        }
        conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
                // eslint-disable-next-line no-console
                console.error("[SMQ conn error", err.message);
            }
        });
        conn.on("close", function() {
              // eslint-disable-next-line no-console
                console.error("[SMQ] reconnecting");
                return setTimeout(connectMessageQueue, 5000);
        });

        // eslint-disable-next-line no-console      
        console.log("[SMQ] connected");
        amqpConn = conn;

        for (let exchange in exchangesAndBindings){
            if (exchangesAndBindings.hasOwnProperty(exchange)){
                listenMessageQueue(exchange);
            }  
        }
    });
}

module.exports = {
    connectMessageQueue,
};