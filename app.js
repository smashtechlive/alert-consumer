const express = require('express');
const app = express();
var config = require('./lib/config.js');
var microConfig = require('../log-consumer/lib/config'); // config file of parallel source
var bodyParser = require('body-parser')
var misc = require('./lib/misc')
var log = require('./lib/log')
let pusage = require('pidusage');
let procStats = require('process-stats');
const Mongoose = require('mongoose');
let diskspace = require('diskspace');
var http  = require('http');
var stats = require('measured').createCollection();
var requestStats = require('request-stats');
var nodemailer = require('nodemailer');
var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
let moment = require('moment');
let momentTimezone = require('moment-timezone');
let async = require('async');


// time constants
const minute = 60000;
const second = minute/60;
const fiveMinutes = minute * 5;
const fifteenMinutes =  minute * 15;
const thirtyMinutes =  minute * 30;
const hour =  minute * 60;
const halfDay =  hour * 12;
const day =  hour * 24;
const week = day * 7;

app.set('json spaces', 2);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");//add urls here instead of being global with CORS
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('Alert Consumer');
})

//
// const { spawn } = require('child_process');
// const ls = spawn('ps', ['-aux']);
//
// ls.stdout.on('data', (data) => {
//   console.log(`stdout: ${data}`);
//
//   let temp = data.toString('utf8');
//
//   temp = temp.split('\n')
//
//   for(let i = 0; i < temp.length; i++){
//   	let t = temp[i].split('\t');
//   	console.log('');
//   	console.log('');
//   	console.log('--> ', t[0]);
//   	console.log('');
//
//   	var g = t[0].split('\s');
//
//   	for(let c = 0; c < g.length; c++){
// 	  	let p = g[c];
// 	  	console.log('-------> ', p);
// 	  }
//
//   }
//
//   console.log('--------------------------------');
//   console.log('--------------------------------');
//
// });

// ls.stderr.on('data', (data) => {
//   console.log(`stderr: ${data}`);
// });
//
// ls.on('close', (code) => {
//   console.log(`child process exited with code ${code}`);
// });

app.listen(3020, function () {
  console.log('Alert Consumer listening on port 3020!');
  log.publish({"logType": "info", "msg": "App start"});
})

/**********************************************************************************************/


function alertSlack(channel, source, field, value) {
    return slack.send({
        "id": 1,
        "type": "message",
        "channel": channel,
        "text": "the microservice" + source + ' has a field: ' + field + 'with a value of: ' + value
    })
}

// send a email notification to a user(s)
// build the message before it hits this function, pass in the message as a param
function alertEmail(email, source, type, value, utcDateTime) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zbrod92@gmail.com',
            pass: 'october2'
        }
    });

    let mailOptions = {
        // from: smashtechNotification@gmail.com
        from: 'zbrod92@gmail.com',
        // to: email,
        to: email,
        // subject: source + type + 'SmashTech'
       // subject: source + ' microservice is having red flags' + type + '. ' + 'The value of ' + type + ' is ' + value ,
        //subject: 'microservice is having red flags',
        subject: source + ' is having red flags',
        // text: 'There has been an issue on microservice' + source +'.' type 'has exceeded the alert threshold with a value of' + value
        text: source + ' microservice is having red flags with the metric ' + type + ' . ' + 'The value of ' + type + ' is ' + value
       // text: ' microservice is having red flags with the metric '
    };

   return transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


// send a SMS  notification to a user(s)
function alertSMS(smsAddress, source, type, value) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zbrod92@gmail.com',
            pass: 'october2'
        }
    });

    let mailOptions = {
        // from: smashtechNotification@gmail.com
        from: 'zbrod92@gmail.com',
        // to: email,
        to: smsAddress,
        // subject: source + type + 'SmashTech'
       //  subject: 'Smashtech notification ' + source + field + value,
        subject: 'Smashtech notification ',
      //  text: 'There has been an issue on microservice' + source +'.' + type + 'has exceeded the alert threshold with a value of' + value
        //text: ' microservice is having red flags with the metric '
        text: source + ' microservice is having red flags with the metric ' + type + '. ' + 'The value of ' + type + ' is ' + value
    };

   return transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('SMS sent: ' + info.response);
        }
    });
}
// TODO add a function that makes sure the developer doesnt get blown up with a million messages



// save to database, check if youve sent that message in the last x interval of time, if not send it
// verify that
// check if you have recieved a message in the last x interval of time
// make the threshold a param from json, so that each developer can set their own thresholds and control whenever they get alerts
// create a function that sends a million records to this function and verify that it only sends one message
// function alertConsumer(req, res) {
//   // get rid of the set interval and call this recursively
//   // not only is it nicer, on an interval there is a chance not all logic is completed
//   // if I call it recursevly I can gurantee that all the needed operations are complete
//   // all inputs will be fed into this by the input json
//   // preferences for alerts and all that come from the input json
//
//     let pollingTime = 6000;
//     setInterval(function () {
//         // alert thresholds
//
//         // make thresholds adjustable
//         // maybe have a mongodb collection that keeps each threshold for each person for each microservice
//         // then do a find for the thresholds
//         // if they are updated then the script will update
//
//
//
//
//         //
//         //
//         //
//         // {
//         //         developerName: 'zach',
//         //             sources: [{source: 'log-consumer', cpuAlertThreshold: 80, rpsAlertThreshold: 80, storageAlertThreshold: 80, memoryAlertThreshold: 80, timeAlertThreshold: 80},
//         //                       {source: 'log-consumer', cpuAlertThreshold: 80, rpsAlertThreshold: 80, storageAlertThreshold: 80, memoryAlertThreshold: 80, timeAlertThreshold: 80}]
//         //         cpuAlertThreshold: '',
//         //         rpsAlertThreshold: '',
//         //         storageAlertThreshold: '',
//         //         memoryAlertThreshold: '',
//         //         timeAlertThreshold: '',
//         //
//         // }
//
//            // developerName: 'zach',
//             //    sources: [{source: 'log-consumer', cpuAlertThreshold: 80, rpsAlertThreshold: 80, storageAlertThreshold: 80, memoryAlertThreshold: 80, timeAlertThreshold: 80}]
//
//
//
//
//         // mongo collection to keep track of notifactions sent out
//         // {
//         //     "lastAlert": '',
//         //     "name": '',
//         //     "lastAlertTimestamp": ''
//         //
//         // }
//         /*
//         if (lastAlert < new Date() - hour) {
//
//         }
//          */
//
//
//
//         let rpsAlertThreshold;
//         let storageAlertThreshold;
//         let memoryAlertThreshold;
//         let timeAlertThreshold;
//         let cpuAlertThreshold;
//         let smsAlert;
//         let emailAlert;
//         let slackAlert;
//
//
//         /*
//             memoryAlertThreshold is the value at which memory needs to be at for a given dev to receive a notification
//             storageAlertThreshold is the value at which memory needs to be at for a given dev to receive a notification
//             rpsAlertThreshold is the value at which memory needs to be at for a given dev to receive a notification
//             timeAlertThreshold is the value at which memory needs to be at for a given dev to receive a notification
//             cpuAlertThreshold is the value at which memory needs to be at for a given dev to receive a notification
//             smsAlert is a boolean that controls if a dev will receive a notification via sms
//             emailAlert is a boolean that controls if a dev will receive a notification via email
//             slackAlert is a boolean that controls if a dev will receive a notification on slack
//         */
//
//
//             // input json that will configure the rest of the thresholds and alerts
//         let inputJson = {
//             'zach': {
//               memoryAlertThreshold: req.body.memoryAlertThreshold,
//               storageAlertThreshold: req.body.storageAlertThreshold,
//               rpsAlertThreshold: req.body.rpsAlertThreshold,
//               timeAlertThreshold: req.body.timeAlertThreshold,
//               cpuAlertThreshold: req.body.cpuAlertThreshold,
//               smsAlert: req.body.smsAlert,
//               emailAlert: req.body.emailAlert,
//               slackAlert: req.body.slackAlert
//             }
//         };
//
//         if(slackAlert === true) {
//             // do slack alert
//         } if(smsAlert === true) {
//             // do smsAlert
//       } if(emailAlert == true) {
//             // do email
//       }
//
//
//
//         // let rpsAlertThreshold  req.params.rpsAlertThreshold;
//         // let storageAlertThreshold = req.params.storageAlertThreshold;
//         // let memoryAlertThreshold = req.params.memoryAlertThreshold;
//         // let timeAlertThreshold = req.params.timeAlertThreshold;
//         // let cpuAlertThreshold = req.params.cpuAlertThreshold;
//
//         let promises = [];
//
//         // map of devs to microservices
//         let zach = {
//             name: 'zach',
//             email: 'zachary@smashtech.com',
//             sms: '9162145091@messaging.sprintpcs.com'
//         };
//         let eric = {
//             name: 'eric',
//             email: 'eric@smashtech.com',
//             sms: '9286711905@vtext.com'
//         };
//         let brandon = {
//             name: 'brandon',
//             email: 'brandongagon@gmail',
//             sms: '6195499615@tmomail.net'
//         };
//         let jeremy = {
//             name: 'jeremy',
//             email: 'jeremy@smashtech.com',
//             sms: '60230019221@vtext.com'
//         };
//         let dylan = {
//             name: 'dylan',
//             email: 'dylan@smashtech.com',
//             sms: '8583349198@vtext.com'
//         };
//         let johnny = {
//             name: 'johnny',
//             email: 'johnny@smashtech.com',
//             sms: '6193583470@txt.att.net'
//         };
//         let rodger = {
//             name: 'rodger',
//             email: 'roger@smashtech',
//             sms: '6197970291@tmomail.net'
//         };
//         let developers = [zach, eric, brandon, jeremy, dylan, johnny, rodger];
//         let microServices = [{source: 'log-consumer', developers: [zach]}];
//         // query redThreshold to find nerve racking metrics
//         let now = new Date();
//         let time = now.getTime() - week;
//         let iso = new Date(time).toISOString();
//         // TODO merge construction of the query
//        return config.db.collection("redThreshold").find({
//             "utcDateTime": {
//                 $gte: iso,
//             },
//             "field.name": 'CPU'
//
//         }).toArray().then((records) => {
//             records.forEach((record) => {
//                 // create an array with all source names
//                 // map through this array
//                 // if the source name is found then send alerts to the given developers associated to that project
//                 // if the source name is not found, then throw an error and send a notifcation to the notification channel
//                 // on slack to let everyone know that one of the microservices wasnt covered in the above array with
//                 // all the sources names
//                 // var result = objArray.map(response => response.name);
//
//                 // protect against duplicates
//                 // item potency
//                 return microServices.map((response) => {
//                     if (record.source === response.source) {
//                         if(record.field.name === 'CPU') {
//                             if (record.field.value > cpuAlertThreshold) {
//                                 return response.developers.forEach((developer) => {
//                                     promises.push(alertEmail(developer.email, record.source, record.field.name, record.field.value));
//                                     promises.push(alertSMS(developer.sms, record.source, record.field.name, record.field.value));
//                                     //alertSlack(developer.slack);
//                                 })
//                             }
//                         } else if(record.field.name === 'STORAGE') {
//                             if (record.field.value > storageAlertThreshold) {
//                                 return response.developers.forEach((developer) => {
//                                     promises.push(alertEmail(developer.email, record.source, record.field.name, record.field.value));
//                                     promises.push(alertSMS(developer.sms, record.source, record.field.name, record.field.value));
//                                     //alertSlack(developer.slack);
//                                 })
//                             }
//                         } else if(record.field.name === 'MEMORY') {
//                             if (record.field.value > memoryAlertThreshold) {
//                                 return response.developers.forEach((developer) => {
//                                     promises.push(alertEmail(developer.email, record.source, record.field.name, record.field.value));
//                                     promises.push(alertSMS(developer.sms, record.source, record.field.name, record.field.value));
//                                     // alertSlack(developer.slack);
//                                 })
//                             }
//                         } else if(record.field.name === 'requestPerSecond') {
//                             if (record.field.value > rpsAlertThreshold) {
//                                 return response.developers.forEach((developer) => {
//                                     promises.push(alertEmail(developer.email, record.source, record.field.name, record.field.value));
//                                     promises.push(alertSMS(developer.sms, record.source, record.field.name, record.field.value));
//                                     //alertSlack(developer.slack);
//                                 })
//                             }
//                         } else if(record.field.name === 'Time') {
//                             if (record.field.value > timeAlertThreshold) {
//                                 return response.developers.forEach((developer) => {
//                                     promises.push(alertEmail(developer.email, record.source, record.field.name, record.field.value));
//                                     promises.push(alertSMS(developer.sms, record.source, record.field.name, record.field.value));
//                                     //alertSlack(developer.slack);
//                                 })
//                             }
//                         }
//                     }
//                 });
//             });
//            return Promise.all(promises);
//        });
//         // array of objects that have the different microservices and the developers associated to those microservices
//         // slack, email, and sms notifactions for users based off the microservice
//         // set higher thresholds for the notifcation that I did to get into redThreshold
//         // you dont want to be woken up in the middle of the night for something small
//         // by default send developers a notification on all platfroms then get a developers preference
//         // I need to build some sort of queue
//         // We dont want to be blown up every second, it would be better if we get a list compiled every so ma ny seconds or whatever the time scale is
//     }, pollingTime)
// }
//
// //alertConsumer();
// alertSlack();

function alertType(developer, record) {
  // TODO add a timestamp field to the recordObject so that I can log that in mongo
  let recordObject = Object.assign(developer, record);
  let promises = [];
  // TODO add a utcDateField either here or on the log consumer to set a timestamp to now for the alert. So that every alert has a timestamp of when it was sent out
  if(developer.smsAlert === true) {
    recordObject.type = 'sms';
    promises.push(log.publish({"logType": "alert", "msg": "", "subObject": {"record": recordObject}}));
  //  promises.push(alertSMS(recordObject.sms, recordObject.source, recordObject.name, recordObject.value));
  } if(developer.slackAlert === true) {
    recordObject.type = 'slack';
    promises.push(log.publish({"logType": "alert", "msg": "", "subObject": {"record": recordObject}}));
  //  promises.push(alertSlack(recordObject.slackChannel, recordObject.source, recordObject.name, recordObject.value));
  } if(developer.emailAlert === true) {
    recordObject.type = 'email';
    promises.push(log.publish({"logType": "alert", "msg": "", "subObject": {"record": recordObject}}));
  //  promises.push(alertEmail(recordObject.email, recordObject.source, recordObject.name, recordObject.value))
  }
  return Promise.all(promises);
}

/**
 * Send alerts given the developers preference and log alerts to log consumer
 * @param alertSettings {Object}
 * @returns {Promise<[any , any , any , any , any , any , any , any , any , any]>}
 */
function alerts(developer, record) {
  let promises = [];
  if (record.name === 'cpu') {
    if (record.value > developer.cpuThreshold) {
      promises.push(alertType(developer, record));
    }
  }
  if (record.name === 'storage') {
    if (record.value > developer.storageThreshold) {
      promises.push(alertType(developer, record));
    }
  }
  if (record.name === 'responseTime') {
    if (record.value > developer.responseTimeThreshold) {
      promises.push(alertType(developer, record));
    }
  }
  if (record.name === 'memory') {
    if (record.value > developer.memory) {
      promises.push(alertType(developer, record));
    }
  }
  if (record.name === 'requestsPerSecond') {
    if (record.value > developer.requestsPerSecondThreshold) {
      promises.push(alertType(developer, record));
    }
  }
}

function alertConsumer2(req, res) {
  // TODO use _id from the redThreshold collection as a unique identifier for the alerts. call it alertid
  // TODO add thresholds to each users inputJson object to control the thresholds to which alerts are sent out
  // map of devs to microservices
  // let zach = {
  //   name: 'zach',
  //   email: 'zachary@smashtech.com',
  //   sms: '9162145091@messaging.sprintpcs.com',
  //   emailAlert: req.body.inputJson['zach'].emailAlert,
  //   smsAlert: req.body.inputJson['zach'].smsAlert,
  //   slackAlert: req.body.inputJson['zach'].slackAlert,
  //   microServices: req.body.inputJson['zach'].microservices
  // };
  // let eric = {
  //   name: 'eric',
  //   email: 'eric@smashtech.com',
  //   sms: '9286711905@vtext.com',
  //   emailAlert: req.body.inputJson['eric'].emailAlert,
  //   smsAlert: req.body.inputJson['eric'].smsAlert,
  //   slackAlert: req.body.inputJson['eric'].slackAlert,
  //   microServices: req.body.inputJson['eric'].microservices
  // };
  // let brandon = {
  //   name: 'brandon',
  //   email: 'brandongagon@gmail',
  //   sms: '6195499615@tmomail.net',
  //   emailAlert: req.body.inputJson['brandon'].emailAlert,
  //   smsAlert: req.body.inputJson['brandon'].smsAlert,
  //   slackAlert: req.body.inputJson['brandon'].slackAlert,
  //   microServices: req.body.inputJson['brandon'].microservices
  // };
  // let jeremy = {
  //   name: 'jeremy',
  //   email: 'jeremy@smashtech.com',
  //   sms: '60230019221@vtext.com',
  //   emailAlert: req.body.inputJson['jeremy'].emailAlert,
  //   smsAlert: req.body.inputJson['jeremy'].smsAlert,
  //   slackAlert: req.body.inputJson['jeremy'].slackAlert,
  //   microServices: req.body.inputJson['jeremy'].microservices
  // };
  // let dylan = {
  //   name: 'dylan',
  //   email: 'dylan@smashtech.com',
  //   sms: '8583349198@vtext.com',
  //   emailAlert: req.body.inputJson['dylan'].emailAlert,
  //   smsAlert: req.body.inputJson['dylan'].smsAlert,
  //   slackAlert: req.body.inputJson['dylan'].slackAlert,
  //   microServices: req.body.inputJson['dylan'].microservices
  // };
  // let johnny = {
  //   name: 'johnny',
  //   email: 'johnny@smashtech.com',
  //   sms: '6193583470@txt.att.net',
  //   emailAlert: req.body.inputJson['johnny'].emailAlert,
  //   smsAlert: req.body.inputJson['johnny'].smsAlert,
  //   slackAlert: req.body.inputJson['johnny'].slackAlert,
  //   microServices: req.body.inputJson['johnny'].microservices
  // };
  // let rodger = {
  //   name: 'rodger',
  //   email: 'roger@smashtech',
  //   sms: '6197970291@tmomail.net',
  //   emailAlert: req.body.inputJson['rodger'].emailAlert,
  //   smsAlert: req.body.inputJson['rodger'].smsAlert,
  //   slackAlert: req.body.inputJson['rodger'].slackAlert,
  //   microServices: req.body.inputJson['rodger'].microservices
  // };

  // let inputData = req.body.inputJson;
  let inputData = {
    'zach': {
      devName: 'zach',
      email: 'zachary@smashtech.com',
      sms: '9162145091@messaging.sprintpcs.com',
      //slackChannel: 'zach'
      slackChannel: '@zach',
      emailAlert: true,
      smsAlert: true,
      slackAlert: true,
      microServices: ['skinnyfit-web'],
      cpuThreshold: 1,
      storageThreshold: 1,
      responseTimeThreshold: 1,
      memory: 1,
      requestsPerSecondThreshold: 1,

  }};
  // set up query time
  let queryThreshold = minute * 100;
  let date = new Date().getTime() - queryThreshold;
  let dateTime = new Date(date);
  let momentTime = momentTimezone.tz(dateTime, "America/Los_Angeles");
  let nowMinusQueryThreshold = moment.utc(momentTime).format("YYYY-MM-DD HH:mm:ss");

  // query the redThreshold collection over x amount of time to find all records that could be sent out for alerts
  let query = {
    "utcDateTime": {
      $gte: nowMinusQueryThreshold,
    },
  };
  return config.db.collection("redThreshold").find(query, {source: 1, name: 1, value: 1, utcDateTime: 1, "_id": 1, route: 1}).toArray().then((records) =>{
    // iterate through each found redThreshold record that could be sent as an alert
    async.eachSeries(records, function (record, cb) {
      async.series([
          function (cb) {

        //////
            // iterate through each developer in the input json file to match the developers to the potential alert by verifying what developers are owners of what sources
            async.eachSeries(inputData, function (developer, cb) {
              async.series([
                  function (cb) {
                    let ownedServices = developer.microServices;
                    // if the given alert has a source that a developer has in their array of microservices then send the alerts
                    if(ownedServices.includes(record.source) === true) {
                      // send alerts to the given developer based off his/her preferences set in the input json file
                      return alerts(developer, record)
                    }
                    cb(null);
                  },
                ],
                function (err) {
                  setTimeout(function () {
                    cb();
                  }, 10);
                });
            });
            ////////
            cb(null);
          },
        ],
        function (err) {
          setTimeout(function () {
            cb();
          }, 10);
        });
    });
  })
}

setTimeout(function() {
  //  console.log('begin');
  let req,res;
  alertConsumer2(req, res);
}, 2000);




















