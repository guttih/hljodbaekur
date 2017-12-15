'use strict';
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

module.exports = class User {

	//userNameOrJson is a required parameter, the others are optional.
	//if userNameOrJson is an json object then all values will be copied from that object.
	//if userNameOrJson is an string then the name of the user will be set to this value.
	constructor(userNameOrJson, password, speech) {
			this.speech = '';
			this.booksRead = [];
			this.booksInterested = [];

		if (userNameOrJson === undefined) {
			return; // nothing to do
		}

		if (userNameOrJson.name !== undefined) {
			//we have an json object so we will copy values from that object
			this.setFromJson(userNameOrJson);
			return;
		}

		this.name = userNameOrJson;

		if (password !== undefined) {
			this.setPassword(password);
		}
		if (speech !== undefined) {
			this.setSpeech(speech);
		}
	}

	setPassword(newPassword) {
		var salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
		this.password = bcrypt.hashSync(newPassword, salt);
	}

	setSpeech(speech) {
		this.speech = speech;
	}

	comparePassword(candidatePassword) {
		return bcrypt.compareSync(candidatePassword, this.password);
	}

	//  returns all data-values of an instance of this class as an json object.
	toJson(){
		return {
			name:            this.name,
			password:        this.password,
			speech:          this.speech,
			booksRead:       this.booksRead,
			booksInterested: this.booksInterested
		};
	}

	//  Copies all data-values from an json object into this class instance.
	setFromJson(jsonObject) {
		this.name            = jsonObject.name;
		this.password        = jsonObject.password;
		this.speech          = jsonObject.speech;
		this.booksRead       = jsonObject.booksRead;
		this.booksInterested = jsonObject.booksInterested;
	}
}

