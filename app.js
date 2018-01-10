const express = require('express');
const app = express();
var config = require('./lib/config.js');
var bodyParser = require('body-parser')
var misc = require('./lib/misc')
var log = require('./lib/log')
var nodemailer = require('nodemailer');
var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);
let moment = require('moment');
let momentTimezone = require('moment-timezone');
let async = require('async');
var alertRouter = require('./routes/alert');



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
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Alert Consumer');
});

// Register Routes
app.use('/', alertRouter);

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
});

/**********************************************************************************************/
//
//
// function sendSlackAlert(channel, source, field, value) {
//     return slack.send({
//         "id": 1,
//         "type": "message",
//         "channel": channel,
//         "text": "the microservice" + source + ' has a field: ' + field + 'with a value of: ' + value
//     })
// }
//
// // send a email notification to a user(s)
// // build the message before it hits this function, pass in the message as a param
// function sendEmailAlert(email, source, type, value, utcDateTime) {
//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'zbrod92@gmail.com',
//             pass: 'october2'
//         }
//     });
//
//     let mailOptions = {
//         // from: smashtechNotification@gmail.com
//         from: 'zbrod92@gmail.com',
//         // to: email,
//         to: email,
//         // subject: source + type + 'SmashTech'
//        // subject: source + ' microservice is having red flags' + type + '. ' + 'The value of ' + type + ' is ' + value ,
//         //subject: 'microservice is having red flags',
//         subject: source + ' is having red flags',
//         // text: 'There has been an issue on microservice' + source +'.' type 'has exceeded the alert threshold with a value of' + value
//         text: source + ' microservice is having red flags with the metric ' + type + ' . ' + 'The value of ' + type + ' is ' + value
//        // text: ' microservice is having red flags with the metric '
//     };
//
//    return transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response);
//         }
//     });
// }
//
//
// // send a SMS  notification to a user(s)
// function sendSMSAlert(smsAddress, source, type, value) {
//     let transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//             user: 'zbrod92@gmail.com',
//             pass: 'october2'
//         }
//     });
//
//     let mailOptions = {
//         // from: smashtechNotification@gmail.com
//         from: 'zbrod92@gmail.com',
//         // to: email,
//         to: smsAddress,
//         // subject: source + type + 'SmashTech'
//        //  subject: 'Smashtech notification ' + source + field + value,
//         subject: 'Smashtech notification ',
//       //  text: 'There has been an issue on microservice' + source +'.' + type + 'has exceeded the alert threshold with a value of' + value
//         //text: ' microservice is having red flags with the metric '
//         text: source + ' microservice is having red flags' + type + '. ' + 'The value of ' + type + ' is ' + value
//     };
//
//    return transporter.sendMail(mailOptions, function(error, info){
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('SMS sent: ' + info.response);
//         }
//     });
// }
// // TODO add a function that makes sure the developer doesnt get blown up with a million messages
//
// function sendAlert(developer, record) {
//   // TODO add a timestamp field to the recordObject so that I can log that in mongo
//   let recordObject = Object.assign(developer, record);
//   let promises = [];
//   // TODO add a utcDateField either here or on the log consumer to set a timestamp to now for the alert. So that every alert has a timestamp of when it was sent out
//   if(developer.smsAlert === true) {
//     console.log('sendSMS');
//     recordObject.type = 'sms';
//     promises.push(sendSMSAlert(recordObject.sms, recordObject.source, recordObject.name, recordObject.value));
//   } if(developer.slackAlert === true) {
//     console.log('sendSlack');
//     recordObject.type = 'slack';
//     promises.push(sendSlackAlert(recordObject.slackChannel, recordObject.source, recordObject.name, recordObject.value));
//   } if(developer.emailAlert === true) {
//     console.log('sendEmail');
//     recordObject.type = 'email';
//     promises.push(sendEmailAlert(recordObject.email, recordObject.source, recordObject.name, recordObject.value))
//   }
//   return Promise.all(promises);
// }
//
// function saveAlert(developer, record) {
//   // TODO add a timestamp field to the recordObject so that I can log that in mongo
//   let recordObject = Object.assign(developer, record);
//   let promises = [];
//   // TODO trim object that is being saved
//   recordObject.sentTo = recordObject.devName;
//   // TODO add a utcDateField either here or on the log consumer to set a timestamp to now for the alert. So that every alert has a timestamp of when it was sent out
//   if(developer.smsAlert === true) {
//     console.log('sendSMS');
//     recordObject.type = 'sms';
//     promises.push(config.db.collection("alert").insertOne(recordObject));
//   } if(developer.slackAlert === true) {
//     console.log('saveSlack');
//     recordObject.type = 'slack';
//     promises.push(config.db.collection("alert").insertOne(recordObject));
//   } if(developer.emailAlert === true) {
//     console.log('saveEmail');
//     recordObject.type = 'email';
//     promises.push(config.db.collection("alert").insertOne(recordObject));
//   }
//   return Promise.all(promises);
// }
// /**
//  * Check if an alert has already been sent
//  * @param developer
//  * @param record
//  * @returns {Promise|*|PromiseLike<T>|Promise<T>}
//  */
// function checkIfAlertExists(developer, record) {
//
//   // let queryThreshold = minute * 1500;
//   // let date = new Date().getTime() - queryThreshold;
//   // let dateTime = new Date(date);
//   // let momentTime = momentTimezone.tz(dateTime, "America/Los_Angeles");
//   // let nowMinusQueryThreshold = moment.utc(momentTime).format("YYYY-MM-DD HH:mm:ss");
//
//   let query = {
//   //  utcDateTime: record.utcDateTime,
//     devName: developer.devName,
//     source: record.source,
//     name: record.name,
//     value: record.value,
//   };
//
//   if(record.route) {
//     query.route = record.route
//   }
//
//   return config.db.collection("alert").find(query).toArray()
//     .then((response) => {
//    if(response.length < 1) {
//      return true;
//     }
//   })
// }
//
// function skinnyFitWebCPUAlert(req, res, callback) {
//
//
//   // let inputData = req.body.inputJson;
//   let inputData = {
//       devName: 'zach',
//       email: 'zachary@smashtech.com',
//       sms: '9162145091@messaging.sprintpcs.com',
//       slackChannel: '@zach',
//       emailAlert: true,
//       smsAlert: true,
//       slackAlert: true,
//       source: 'skinnyfit-web',
//       name: 'responseTime',
//       value: {
//         $gte: 1,
//       },
//   };
//   // TODO make this a get route not just a script, this way people can upload their params of their desired alert into the the req.query
//   // let inputData = {
//   //   devName: req.query.devName,
//   //   email: req.query.email,
//   //   sms: req.query.sms,
//   //   slackChannel: req.query.slackChannel,
//   //   emailAlert: req.query.emailAlert,
//   //   smsAlert: req.query.smsAlert,
//   //   slackAlert: req.query.slackAlerta,
//   //   source: req.query.source,
//   //   name: req.query.name,
//   //   value: {
//   //     $gte: req.query.value,
//   //   },
//   // };
//
//   // set up query time
//   let queryThreshold = minute * 300;
//   let date = new Date().getTime() - queryThreshold;
//   let dateTime = new Date(date);
//   let momentTime = momentTimezone.tz(dateTime, "America/Los_Angeles");
//   let nowMinusQueryThreshold = moment.utc(momentTime).format("YYYY-MM-DD HH:mm:ss");
//
//   let query = {
//     'source': inputData.source,
//     'name': inputData.name,
//     'value': inputData.value,
//     // should this be set or should this be variable based off the input json as well
//     "utcDateTime": {
//       $gte: nowMinusQueryThreshold,
//     },
//   };
//
//   if(inputData.route) {
//     query.route = inputData.route;
//   }
//   // beginning wrap in promise
//   return config.db.collection("redThreshold").find(query, {source: 1, name: 1, value: 1, utcDateTime: 1, "_id": 1, route: 1}).toArray().then((records) =>{
//     if(records.length < 1) {
//      console.log('No Records');
//       return continuousAlert();
//     }
//     // iterate through each found redThreshold record that could be sent as an alert
//     async.eachSeries(records, function (record, cb) {
//       async.series([
//         function (cb) {
//         // wrap in promise
//         checkIfAlertExists(inputData, record).then((response) => {
//           if(response === true) {
//             console.log('sending now');
//             sendAlert(inputData, record).then((next) => {
//               saveAlert(inputData, record);
//             })
//           } else if(!response) {
//             console.log('sent already')
//           }
//         });
//             cb(null);
//           },
//         ],
//         function (err) {
//           setTimeout(function () {
//             cb();
//           }, 10);
//         });
//     });
//     // how can I be confident that it has iterated through all records
//     // callback, restart the alert consumer
//     // TODO add catch block for mongo authenticate, just have it keep going not fail the whole server
//     console.log('RESTART', records.length);
//       continuousAlert();
//   //  }
//   })
//
//   // end wrap of promise
// }
// //start alert consumer
// setTimeout(function() {
//   let req,res;
//   skinnyFitWebCPUAlert(req, res);
// }, 5000);
//
// // continuously run alert consumer
// function continuousAlert(){
//   // call first function and pass in a callback function which
//   // first function runs when it has completed
//   setTimeout(function() {
//     console.log('CONTINIOUS ALERT');
//     let req,res;
//     skinnyFitWebCPUAlert(req, res);
//   }, 20000);
//
//  }
//
//
//
//
//
//
//
//
//