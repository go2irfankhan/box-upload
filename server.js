var express    = require('express');
var bodyParser = require('body-parser');
var app        = express();
var morgan     = require('morgan');
var request = require('request');
var fs = require('fs');

app.use(morgan('dev'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

var router = express.Router();

router.use(function(req, res, next) {
	console.log('Something is happening.');
	next();
});

router.get('/', function(req, res) {
	res.json({ message: 'Welcome to api!' });	
});

router.post('/upload', function(hrequest, responseh) {
	
	var attachmentId = hrequest.body.attachmentId;
	var accessToken = hrequest.body.token;
	var parent_folder_id = hrequest.body.folderId;
	
	pg.connect(conString, function(err, client, done) {
	    client.query('SELECT name, body FROM Salesforce.attachment where id = $1',[attachmentId] ,function(err, result) {
	      done();
	      if (err)
	       { console.error(err); response.send("Error " + err); 
	      	logger.log({ type: 'err', msg: err });
	       }
	      else
	       {  console.log('result.rows', result.rows);
	       	  var row = result.rows[0];
	    	  
	    	  var fileObj = new Buffer(row.body);
	    	  var name = new Buffer(row.name);
	    	  
	    	  var r = request.post({
	    		  url: 'https://upload.box.com/api/2.0/files/content?parent_id='+parent_folder_id,
	    		  headers: { 'Authorization': 'Bearer ' + accessToken }
	    	  }, 
		    	  function requestCallback(err, res, body) {
		    		  console.log("body="+body);
		    		  console.log("res="+JSON.stringify(res));
		    		  console.log("err="+err);
		    		  responseh.json({"statusCode":res.statusCode,"body":res.body});
		    	  }	
	    	  );
	    	  
	    	  var form = r.form();
	    	  form.append('file', fileObj, { filename: name });
	    	  
	    	  pg.end();
	       }
	    });
	  });
});

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
