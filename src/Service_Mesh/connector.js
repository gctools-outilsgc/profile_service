require("dotenv").config();
const config = require("../config");
const amqp = require("amqplib/callback_api");
const { msgHandler } = require("./handler");

// object to hold connection
var amqpConn = null;
// array of keys
const bindingKeys = ["user.new"];

// TODO: Create an arry of exchanges and associated keys to be passed into connection manager.

function closeOnErr(err) {
    if (!err) {
        return false;
    }
    console.error("[SMQ] error", err);
    amqpConn.close();
    return true;
  }

function listenMessageQueue(){
    amqpConn.createChannel(function(err, ch) {

        if (closeOnErr(err)) {
            return;
        }
        ch.on("error", function(err) {
        console.error("[SMQ] channel error", err.message);
        });
        ch.on("close", function() {
        console.log("[SMQ] channel closed");
        });
        
        // Replace with a funtion to handle multiple exchanges and keys
        var ex = "account";
   
        ch.assertQueue("profile", {durable: true}, function(err, q) {
            if (closeOnErr(err)) {
                return;
            }
    
            bindingKeys.forEach(function(key) {
            ch.bindQueue(q.queue, ex, key);
            });
    
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

            console.log(" [*] Waiting for logs. To exit press CTRL+C");
        });
    });
}

// if the connection is closed or fails to be established at all, we will reconnect
function connectMessageQueue(){
  
    amqp.connect("amqp://" + process.env.MQ_USER + ":" + process.env.MQ_PASS + "@" + config.rabbitMQ.host +"?heartbeat=60", function(err, conn) {
        if (err) {
            console.error("[SMQ]", err.message);
            return setTimeout(connectMessageQueue, 5000);
          }
          conn.on("error", function(err) {
            if (err.message !== "Connection closing") {
              console.error("[SMQ conn error", err.message);
            }
          });
          conn.on("close", function() {
            console.error("[SMQ] reconnecting");
            return setTimeout(connectMessageQueue, 5000);
          });
      
          console.log("[SMQ] connected");
          amqpConn = conn;
      
          listenMessageQueue();


    });
}

module.exports = {
    connectMessageQueue,
};

