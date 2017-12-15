var express = require('express');
var fs = require("fs");
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();

var disk = require('./utils/disk.js');
/*var users = require('./utils/users.js');
const User = require('./models/User');*/

var fileList, books, authors = { items:[]};
var configFileString = __dirname + '/config.json';
var fileListString   = __dirname + '/data/filelist.json';
var fileBookString   = __dirname + '/data/books.json';
var fileAuthorString = __dirname + '/data/authors.json';


var config = disk.getConfig(configFileString);

//users.run();
if (config === undefined) {
	config = {  
		port: 3321,
		filePath: '../files',
	};
	disk.setConfig(configFileString, config, function() {
		console.log("new values set");
	});
	
}

////////////////////////////////////////////////////////////////////////

app.use(express.static(config.filePath));
app.use(express.static('clientDist'));
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

////////////////////////////////////////////////////////////////////////

//list all files from the disk and read them to the fileList object.
var rebuildData = function rebuildData(callback){

	disk.listAllfiles(config.filePath, function(err, fileList) {
		if (err) {
			throw err;
		}
		var filePathLength = config.filePath.length +1;
		var x;
		for(var i = 0; i < fileList.length; i++) {
			if (fileList[i].indexOf(config.filePath) === 0 ) {
				fileList[i] = fileList[i].substring(filePathLength);
			}
		};

		if (fileList !== undefined && fileList.length > 0) {
			disk.setConfig(fileListString, fileList, function() {
				console.log(filelist.items.count + ' fileList, saved.');
			});
		}
		books = disk.createBookItems(fileList, authors);
		if (authors.items.length < 1){
			console.log("Unable to get any authors from books and fileList");
		}
	
		if (books !== undefined && books.items.length > 0) {
			
			disk.setConfig(fileBookString, books)
			.then( () => {
				console.log('books saved');
				if (!disk.fileExists(fileAuthorString)) {
					disk.setConfig(fileAuthorString, authors, () => {
						console.log(authors.items.length + ' authors, saved.');
					});
				}
			});
		} else {
			console.log("No files found, using old data for debugging");	
			fileList = disk.getConfig(fileListString);
			books = disk.getConfig(fileBookString);
			authors = disk.getConfig(fileAuthorString);
		}
		console.log("Count of objects used:");
		console.log("fileList:" + fileList.length);
		console.log("books   :" + books.items.length);
		console.log("authors :" + authors.items.length);
		
		if (callback !== undefined){
			callback(fileList);
		}
	});
}
rebuildData();

var allowCrossDomain = function allowCrossDomain(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
}
app.use(allowCrossDomain);



app.set('port', config.port);
console.log('using port: ' + config.port);
app.get('/api/files/rebuild', function(req, res) {
	console.log('get /files/rebuild');
	rebuildData( (fileList) => {
		res.send(fileList);
	});
			
});

app.get('/api/files', function(req, res) {
		console.log('route: /files');
		fileList = disk.getConfig(fileListString);
		res.send(fileList);
});

app.get('/api/files/:filePath', function(req, res) {
	console.log('route: /files/:filePath');
	var filePath = req.params.filePath;
	console.log('/files/:filePath');
	console.log('filePath:'+filePath);
	
});

app.get('/api/books', function(req, res, next) {
	console.log('route: /books');
	var books = disk.getConfig(fileBookString);
	res.send(books.items);
	
});

app.get('/api/books/lang/:val', function(req, res) {
	console.log('route: /books/lang/:val');
	var value = req.params.val;
	var books = disk.getConfig(fileBookString);
	var ret = disk.filterItemOut('lang', value, books.items);
	res.send(ret);
	
});

app.get('/api/books/speech/:val', function(req, res) {
	console.log('route: /books/speech/:val');
	var value = req.params.val;
	var books = disk.getConfig(fileBookString);
	var ret = disk.filterItemOut('speech', value, books.items);
	res.send(ret);
	
});

//returns all authors
app.get('/api/authors', function(req, res, next) {
	console.log('route: /authors');
	var authors = disk.getConfig(fileAuthorString);
	res.send(authors.items);
	
});


//returns authos with the given attribute 
app.get('/api/authors/lang/:val', function(req, res) {
	var value = req.params.val;
	var authors = disk.getConfig(fileAuthorString);
	var ret = disk.filterItemOut('lang', value, authors.items);
	res.send(ret);
});

app.post('/api/login', function(req, res) {
	var name = req.body.name;
	var password = req.body.password;
	console.log('/api/login: ' +name);
	if (name == 'guttih' && password == '1234') {
		var user = new User(name, password);
		var json = user.toJson();
		res.send(json);
	} else {
		res.status(422).send({ error: 'Invalid user/password combination' });
	}
});

app.listen(app.get('port'), function(){
		
});