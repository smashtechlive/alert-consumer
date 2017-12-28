var request = require('request')


exports.getUrl = function(url, cb){
	request(url, function (err, response, res) { 

		try {
			res = JSON.parse(res);
		}
		catch(e){
			//could not parse response which in some cases is ok 
		}

		cb(err, res)
	});
}

exports.postUrl = function(url, body, cb){
  request.post({url: url, form: body}, function(err, httpResponse, body){ 

    try {
      body = JSON.parse(body);
    }
    catch(e){
      //could not parse response which in some cases is ok 
    }

    cb(err, body);

   })
}

