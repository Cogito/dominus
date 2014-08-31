Hexes = new Meteor.Collection('hexes')
Castles = new Meteor.Collection('castles')
Armies = new Meteor.Collection('armies')
Market = new Meteor.Collection('market')
Villages = new Meteor.Collection('villages')
//Notifications = new Meteor.Collection('notifications')
Notifications = new Meteor.Collection('notificationsnew')
Dailystats = new Meteor.Collection('dailystats')
Markethistory = new Meteor.Collection('markethistory')
Chatrooms = new Meteor.Collection('chatrooms')
Chats = new Meteor.Collection('chats')
Forums = new Meteor.Collection('forums')
Threads = new Meteor.Collection('threads')
Messages = new Meteor.Collection('messages')
Charges = new Meteor.Collection('charges')
Gamestats = new Meteor.Collection('gamestats')
Jobstats = new Meteor.Collection('jobstats')
Jobqueue = new Meteor.Collection('jobqueue')
Latestchats = new Meteor.Collection('latestchats')
Latestmessages = new Meteor.Collection('latestmessages')
Settings = new Meteor.Collection('settings')
Moves = new Meteor.Collection('moves')
Battles = new Meteor.Collection('battles')


// // //log every find
// Meteor.startup(function () {
// 	var wrappedFind = Meteor.Collection.prototype.find;

// 	console.log('[startup] wrapping Collection.find')

// 	Meteor.Collection.prototype.find = function () {
// 		console.log(this._name + '.find', JSON.stringify(arguments))
// 		return wrappedFind.apply(this, arguments);
// 	}
// })

// Meteor.startup(function () {
// 	var wrappedFindOne = Meteor.Collection.prototype.findOne;

// 	console.log('[startup] wrapping Collection.findOne')

// 	Meteor.Collection.prototype.findOne = function () {
// 		console.log(this._name + '.findOne', JSON.stringify(arguments))
// 		return wrappedFindOne.apply(this, arguments);
// 	}
// })

// // log every update
// Meteor.startup(function () {
// 	var wrappedUpdate = Meteor.Collection.prototype.update;

// 	console.log('[startup] wrapping Collection.update')

// 	Meteor.Collection.prototype.update = function () {
// 	  console.log(this._name + '.update', JSON.stringify(arguments))
// 	  return wrappedUpdate.apply(this, arguments);
// 	}
// })
