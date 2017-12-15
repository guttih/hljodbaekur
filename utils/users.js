'use strict';
const User = require('../models/User');

module.exports.run = function run() {

var user1 = new User('user1', 'password1');
var jsonUser = user1.toJson();
var jsonUserClass = new User(jsonUser);
var user2 = new User('user2', 'password2');
var user3 = new User('user3', 'password3', 'is');
var user4 = new User('user4', 'password3');
var b1 = user1.comparePassword('passwordx1111');
	b1 = user1.comparePassword('password1');
var b2 = user2.comparePassword('passwordx1111');
	b2 = user2.comparePassword('password2');
var b3 = user3.comparePassword('passwordx1111');
	b3 = user3.comparePassword('password3');
var b4 = user4.comparePassword('passwordx1111');
	b4 = user4.comparePassword('password41111');

}