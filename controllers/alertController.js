const express = require('express');
const app = express();
var config = require('../lib/config.js');
var bodyParser = require('body-parser')
let pusage = require('pidusage');
let procStats = require('process-stats');
const Mongoose = require('mongoose');
let diskspace = require('diskspace');
var http  = require('http');
var stats = require('measured').createCollection();
var requestStats = require('request-stats');
var nodemailer = require('nodemailer');
var MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
//var MY_SLACK_WEBHOOK_URL = 'https://myaccountname.slack.com/services/hooks/incoming-webhook?token=myToken';
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

var requests = [];
var requestTrimThreshold = 5000;
var requestTrimSize = 4000;
var requests = [];
var requestTrimThreshold = 5000;
var requestTrimSize = 4000;


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

// send a slack notification to a user(s)
function alertSlack(channel, source, field, value) {
    return slack.send({
        //channel: 'notification'
        channel: '#devbackend',
        // text: 'Microserve' + source + field + value
        text: 'Microserve',
        username: 'Zachary Brody'
    })
    // posts to the alert channel
    // slack.alert({
    //     text: 'Current server stats',
    //     attachments: [
    //         {
    //             fallback: 'Required Fallback String',
    //             fields: [
    //                 { title: 'CPU usage', value: '7.51%', short: true },
    //                 { title: 'Memory usage', value: '254mb', short: true }
    //             ]
    //         }
    //     ]
    // });
}

// send a email notification to a user(s)
function alertEmail(email, source, type, value) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zbrod92@gmail.com',
            pass: 'october2'
        }
    });

    var mailOptions = {
        // from: smashtechNotification@gmail.com
        from: 'zbrod92@gmail.com',
        // to: email,
        to: 'zachary@smashtech.com',
        // subject: source + type + 'SmashTech'
        subject: 'Smashtech Notification',
        // text: 'There has been an issue on microservice' + source +'.' type 'has exceeded the alert threshold with a value of' + value
        text: 'There has been an issue on microservice'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}


// send a SMS  notification to a user(s)
function alertSMS(smsAddress, source, type, value) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zbrod92@gmail.com',
            pass: 'october2'
        }
    });

    var mailOptions = {
        // from: smashtechNotification@gmail.com
        from: 'zbrod92@gmail.com',
        // to: email,
        to: '61935834708@txt.att.net',
        // subject: source + type + 'SmashTech'
        // subject: 'Smashtech Notification',
        // text: 'There has been an issue on microservice' + source +'.' type 'has exceeded the alert threshold with a value of' + value
        text: 'There has been an issue on microservice'
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('SMS sent: ' + info.response);
        }
    });
}



// promise.all the emails and sms and stuff
function alertConsumer(req, res) {
    let pollingTime = 60000;
    setInterval(function () {

        // alert thresholds
        let storageAlertThreshold = 60;
        let memoryAlertThreshold = 60;
        let cpuAlertThreshold = 60;
        let rpsAlertThreshold = 200;
        let timeAlertThreshold = 1500;

        // map of devs to microservices
        let zach = {
            name: 'zach',
            email: 'zachary@smashtech.com',
            sms: '9162145091@messaging.sprintpcs.com'
        };
        let eric = {
            name: 'eric',
            email: 'eric@smashtech.com',
            sms: '928-671-1905@vtext.com'
        };
        let brandon = {
            name: 'brandon',
            email: 'brandongagon@gmail',
            sms: '6195499615@tmomail.net'
        };
        let jeremy = {
            name: 'jeremy',
            email: 'jeremy@smashtech.com',
            sms: '60230019221@vtext.com'
        };
        let dylan = {
            name: 'dylan',
            email: 'dylan@smashtech.com',
            sms: '8583349198@vtext.com'
        };
        let johnny = {
            name: 'johnny',
            email: 'johnny@smashtech.com',
            sms: '61935834708@txt.att.net'
        };
        let rodger = {
            name: 'rodger',
            email: 'roger@smashtech',
            sms: '6197970291@tmomail.net'
        };
        let developers = [zach, eric, brandon, jeremy, dylan, johnny, rodger];

        let microServices = [{source: 'log-consumer', developers: [zach]}]

        // query redThreshold to find nerve racking metrics
        let now = new Date();
        let time = now.getTime() - min;
        let iso = new Date(time).toISOString();
        //console.log(config);
        return config.db.collection("redThreshold").find({
            utcDateTime: {
                $gte: iso,
            }
        }).toArray().then((records) => {
            records.forEach((record) => {
                // create an array with all source names
                // map through this array
                // if the source name is found then send alerts to the given developers associated to that project
                // if the source name is not found, then throw an error and send a notifcation to the notification channel
                // on slack to let everyone know that one of the microservices wasnt covered in the above array with
                // all the sources names
                // var result = objArray.map(response => response.name);
                return microServices.map((response) => {
                    if (record.source === response.source) {
                        if(record.field.name === 'CPU') {
                            if (record.field.value > cpuAlertThreshold) {
                                response.developers.forEach((developer) => {
                                    alertEmail(developer.email);
                                    alertSMS(developer.sms);
                                    //alertSlack(developer.slack);
                                })
                            }
                        } else if(record.field.name === 'STORAGE') {
                            if (record.field.value > storageAlertThreshold) {
                                response.developers.forEach((developer) => {
                                    alertEmail(developer.email);
                                    alertSMS(developer.sms);
                                    //alertSlack(developer.slack);
                                })
                            }
                        } else if(record.field.name === 'MEMORY') {
                            if (record.field.value > memoryAlertThreshold) {
                                response.developers.forEach((developer) => {
                                    alertEmail(developer.email);
                                    alertSMS(developer.sms);
                                    // alertSlack(developer.slack);
                                })
                            }
                        } else if(record.field.name === 'requestPerSecond') {
                            if (record.field.value > rpsAlertThreshold) {
                                response.developers.forEach((developer) => {
                                    alertEmail(developer.email);
                                    alertSMS(developer.sms);
                                    //alertSlack(developer.slack);
                                })
                            }
                        } else if(record.field.name === 'Time') {
                            if (record.field.value > timeAlertThreshold) {
                                response.developers.forEach((developer) => {
                                    alertEmail(developer.email);
                                    alertSMS(developer.sms);
                                    //alertSlack(developer.slack);
                                })
                            }
                        }
                    }
                    // }
                });
            })
        })
        // array of objects that have the different microservices and the developers associated to those microservices
        // slack, email, and sms notifactions for users based off the microservice
        // set higher thresholds for the notifcation that I did to get into redThreshold
        // you dont want to be woken up in the middle of the night for something small
        // by default send developers a notification on all platfroms then get a developers preference
        // I need to build some sort of queue
        // We dont want to be blown up every second, it would be better if we get a list compiled every so ma ny seconds or whatever the time scale is
    }, pollingTime)
}
alertConsumer();
// alertEmail();
// alertSMS();
// alertSlack();
