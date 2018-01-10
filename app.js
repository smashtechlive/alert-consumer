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
