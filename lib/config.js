const MongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let rmqUrl = null, rmqUser = null, rmqPass = null;

if(process.env.commonSetup == "localhost"){
    process.env.NODE_ENV = 'development';
    process.env.db = 'stage';
    process.env.rmq = 'stage';
}
else if(process.env.commonSetup == "stage"){
    process.env.NODE_ENV = 'development';
    process.env.db = 'stage';
    process.env.rmq = 'stage';
}
else if(process.env.commonSetup == "production"){
    process.env.NODE_ENV = 'production';
    process.env.db = 'production';
    process.env.rmq = 'production';
}

exports.logEnv = process.env.commonSetup || process.env.db;

if(process.env.NODE_ENV){
    if(process.env.NODE_ENV == process.env.db && process.env.db == process.env.rmq)
        console.log("Express and runAS are in sync :-) ")
    else if(process.env.NODE_ENV == 'production' || process.env.db == 'production'){
        console.log('');
        console.log('------------------------------------------------------------------------------');
        console.log('WARNING: You have at least one environment variable set to production and the others do not match. ');
        console.log('------------------------------------------------------------------------------');
        console.log('');
    }

}
else {
    console.log('');
    console.log('------------------------------------------------------------------------------');
    console.log('You MUST set NODE_ENV environment variable. (development/production) ');
    console.log('------------------------------------------------------------------------------');
    console.log('');
}

if(process.env.rmq == 'stage'){
    rmqUrl = "stage-log-rmq.skinnyfit.com";
    rmqUser = "smashtech";
    rmqPass = "rabbit13242017";
    exports.rmqConnectionString = 'amqp://'+rmqUser+':'+rmqPass+'@'+ rmqUrl;
}
else if(process.env.rmq == 'production'){
    rmqUrl = "log-rmq.skinnyfit.com";
    rmqUser = "smashtech";
    rmqPass = "rabbit13242017";
    exports.rmqConnectionString = 'amqp://'+rmqUser+':'+rmqPass+'@'+ rmqUrl;
}
else {
    console.log('');
    console.log('------------------------------------------------------------------------------');
    console.log('You MUST set rmq environment variable. (stage/production) ');
    console.log('------------------------------------------------------------------------------');
    console.log('');
}

//put these in encrypted file to be deployed with Chef later
var mongoUser = 'smashtechUser0';
var mongoPass = 'Smash2017tech!!';
var mongoUrl = '';
var mongoPort = 27017;
var mongoOptions = '';

if(process.env.db == 'stage'){
    mongoUrl = 'stage-log-db.skinnyfit.com';
}
else if(process.env.db == 'production'){
    mongoUrl = 'log-db.skinnyfit.com';
}
else {
    console.log('');
    console.log('------------------------------------------------------------------------------');
    console.log('You MUST set db environment variable. (stage/production) ');
    console.log('------------------------------------------------------------------------------');
    console.log('');
}

var url = 'mongodb://'+mongoUser+'%3A'+mongoPass+'%24@'+mongoUrl+':'+mongoPort+'/skinnyfit'+mongoOptions;

MongoClient.connect(url, function(err, db) {

    if(err)
        console.log("Could NOT connect to mongo server!!! " + mongoUrl, err);

    //In the current mongo 3.4 we use db.authenticate enables us to authenticate with the database but in mongo 3.6 it will bundle auth inside the connect method above which does not currently work as an auth method
    console.log('');
    db.authenticate(mongoUser, mongoPass, function(err, res){

        exports.db = db;

        if(err)
            console.log("Could NOT connect to mongo server!!! " + mongoUrl, err);

        console.log('');

        if(!err){
            //actually use skinnyfit


            MongoClient.connect(url, function(err, db) {

                if(err)
                    console.log("Could NOT connect to mongo server!!! " + mongoUrl, err);
                else
                    console.log("Connected successfully to mongo server at: " + mongoUrl);




            });
        }
    })

});
exports.rmqServerName = "health-monitor";//ideally match repo name
