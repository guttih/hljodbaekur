var express = require('express');
const fs = require('fs');
//var path = require('path');

// Returns true if file exists otherwise it returns false.
module.exports.fileExists = function fileExists(filePath){
	try
	{
		return fs.statSync(filePath).isFile();
	}
	catch (err)
	{
		return false;
	}
}

// Returns true if a path exits and it is a directory.
module.exports.dirExists = function dirExists(path) {   
	var ret = false;
	try {
		ret = fs.lstatSync(path).isDirectory();
		return ret;
	} catch (e) {		
		return false;
	}
}

// Returns true if all parameters checkout otherwise false.
function validateParameters (arrParams) {
	if(typeof arrParams !== "object") {
		return false;
	}
	for(var i = 0; i < arrParams.length; i++){
		var testSubject = arrParams[i];
		if(testSubject === null) {
			return false;
		} 
		if(testSubject === "") {
			return false;
		}
	}
	return true;
}
/*
	//returns undefined if file is not found
	example on how to use:
	var file = __dirname + '/config.json';
	var vals = { key1: "value1", key2: "value2"};
	disk.setConfig(file, vals, function(){
		vals = {};
		vals = disk.getConfig(file);
		console.log(vals);
	});
*/
module.exports.getConfig = function getConfig(file){
	var conf;
	if (this.fileExists(file)){
		try{
			conf = require(file);
		} catch(e) {
			console.log('error reading ' + file);
		}
	}
	return conf;
};

module.exports.setConfig = function setConfig(file, conf, successFunc, errorFunc){
		
		return new Promise((resolve, reject)=> {
		
			var str = JSON.stringify(conf);
			fs.writeFile(file, str, function(err) {

				if(err) {
					//console.log("Could not write values to the config file"+ file +".  Error : " + err);
					return reject(err);
				} else {
					//success
					return resolve(conf);
				}
			});
		});
};


module.exports.Dirs = function(testFolder) {

	fs.readdir(testFolder, (err, files) => {
		files.forEach(file => {
			console.log(file);
		});
	});
}
/*
	Example on how to use:
		disk.Dirs('./files')
		.then(files => {
			console.log('got files');
			console.log(files);
		})
		.catch(err => {
			console.log('error');
			console.error(err);
		});
*/
exports.Dirs = function Dirs (strFolder) {
	return new Promise((resolve, reject) => {
		fs.readdir(strFolder, (err, result) => {
		if (err) {
			return reject(err);
		}
			return resolve(result);
		});
	});
};

//lists all files into a array, the function will list subdirectories also.
exports.listAllfiles = function listAllfiles (dir, done) {
	var results = [];
	fs.readdir(dir, function(err, list) {
		if (err) return done(err);
		var pending = list.length;
		if (!pending) return done(null, results);
		list.forEach(function(file) {
			file = dir + '/' +file;//path.resolve(dir, file);
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					listAllfiles(file, function(err, res) {
						results = results.concat(res);
						if (!--pending) done(null, results);
					});
				} else {
					results.push(file);
					if (!--pending) done(null, results);
				}
			});
		});
	});
};

function addOrFindAuthorId(authorName, language, authors) {
	var len = authors.items.length;
	for (var i = 0; i < len; i++ ){
		if (authors.items[i].name === authorName) {
			return authors.items[i].id;
		}
	}
	//Nothing found adding a new author
	authors.items.push({
		id: len,
		name: authorName,
		lang: language
	});
	return len;  //which is the id
}

function makeItemFromPath(filePath, id, authors){
	var ret = {
				id    : id,
				title : "",
				path  : filePath,
				speech: "",
				lang  : "",
		};
	var iSpeech, 
		iAuthor, 
		iTitle, 
		iZip,
		iFind = filePath.indexOf('Enskt tal/');
		if (iFind > -1) {
			ret.speech = "en";
			ret.lang = "er";
			iAuthor = iFind + 10;
		} else {
			iFind = filePath.indexOf('Islenskt tal/');
			if (iFind < 0 ) { 
				return ret; 
			}
			ret.speech = "is";
			iFind = filePath.indexOf('Erlendar/', iFind + 13);
			if (iFind > -1) {
				ret.lang = "er";
				iAuthor = iFind + 9;
			} else {
				iFind = filePath.indexOf('Islenskar/', iFind + 13);
				if (iFind < 0 ) { 
					return ret; 
				}
				ret.lang = "is";
				iAuthor = iFind + 10;
			}
		}
		iTitle = filePath.indexOf('/', iAuthor);
		var authorName = filePath.substr(iAuthor, iTitle - iAuthor);
		ret.authorId = addOrFindAuthorId(authorName, ret.lang, authors);
		iZip = filePath.length -4;
		ret.title = filePath.substr(iTitle + 1, iZip - (iTitle + 1));
		return ret;
	
}

exports.createBookItems = function createBookItems(fileList, authors){
	var bookList={ items: []};
	if (fileList === undefined)	{
		return;
	}
	fileList.forEach(function(item, index){
			if (item.endsWith('.zip')){
				var item = makeItemFromPath(item, bookList.items.length, authors);
				bookList.items.push(
					 item
				);
				
			} else {
				console.log(index);
			}
			

	});
	return bookList;
}

module.exports.filterItemOut = function filterItemOut(filterKey, matchValue, objectArr) {
		var ret = [];
		objectArr.forEach(item => {
			if (item[filterKey] === matchValue) {
				ret.push(item);
			}
		});
		return ret;
}