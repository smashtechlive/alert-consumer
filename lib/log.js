var config = require('./config');
var moment = require('moment');

var open = require('amqplib').connect(config.rmqConnectionString);
var channel = null;
var queue = 'logs';

// Publisher 
open.then(function(conn) {
  return conn.createChannel();
}).then(function(ch) {
  channel = ch;
  console.log('RMQ connected :-) ');
}).catch(console.warn);
 

exports.publish = function(json){
  json.source = config.rmqServerName || "unknown";
  json.env = config.logEnv || "unknown";
  json.utcDateTime = moment.utc().format("YYYY-MM-DD HH:mm:ss");
  exports.publishDirect(json);
}

exports.publishDirect = function(json){
  if(channel){
    publishRaw(json);
  }
  else {
    //RMQ may not have connected yet so try again but only ONCE 
    setTimeout(function(){
      try{
        publishRaw(json);
      }
      catch(e){
        console.log('Could not send message through RMQ. (lack of connection)');
      }
    }, 2000);
  }
}



exports.consume = function(cb){

  //add try catch 
  if(channel){
    consumeRaw(cb);
  }
  else {
    //RMQ may not have connected yet so try again but only ONCE 
    setTimeout(function(){
      try{
        consumeRaw(cb);
      }
      catch(e){
        console.log('Could not consume message through RMQ. (lack of connection)');
      }
    }, 2000);
  }
}




//calling this directing will crash code...it can only be called from inside the exports publish function that has if statement protection and try catch blocks 
function publishRaw(json){
  channel.assertQueue(queue).then(function(ok) {
    channel.sendToQueue(queue, new Buffer(JSON.stringify(json)));
  });
}



//calling this directing will crash code...it can only be called from inside the exports consume function that has if statement protection and try catch blocks 
function consumeRaw(cb){
  channel.assertQueue(queue).then(function(ok) {
    channel.consume(queue, function(msgObject) {

      var msg = msgObject.content.toString();
      var json = null;
      try{
        json = JSON.parse(msg);
      } catch (e){}

      cb(msgObject, json, function(msgObject){
        channel.ack(msgObject);
      })

    });
  });
}



