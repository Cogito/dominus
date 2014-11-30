Hexes = new Meteor.Collection('hexes')
Castles = new Meteor.Collection('castles')
Armies = new Meteor.Collection('armies')
Villages = new Meteor.Collection('villages')
Dailystats = new Meteor.Collection('dailystats')
Markethistory = new Meteor.Collection('markethistory')
Forums = new Meteor.Collection('forums')
Threads = new Meteor.Collection('threads')
Messages = new Meteor.Collection('messages')
Charges = new Meteor.Collection('charges')
Gamestats = new Meteor.Collection('gamestats')
Jobstats = new Meteor.Collection('jobstats')
Jobqueue = new Meteor.Collection('jobqueue')
Latestmessages = new Meteor.Collection('latestmessages')
Moves = new Meteor.Collection('moves')

if (Meteor.isServer) {
	Hexes.allow({insert: false, update: false, remove: false})
	Castles.allow({insert: false, update: false, remove: false})
	Armies.allow({insert: false, update: false, remove: false})
	Market.allow({insert: false, update: false, remove: false})
	Villages.allow({insert: false, update: false, remove: false})
	Notifications.allow({insert: false, update: false, remove: false})
	Dailystats.allow({insert: false, update: false, remove: false})
	Markethistory.allow({insert: false, update: false, remove: false})
	Forums.allow({insert: false, update: false, remove: false})
	Threads.allow({insert: false, update: false, remove: false})
	Messages.allow({insert: false, update: false, remove: false})
	//Meteor.users.deny({update: function () { return true; }})
	Meteor.users.allow({insert: false, update: false, remove: false})
	Charges.allow({insert: false, update: false, remove: false})
	Gamestats.allow({insert: false, update: false, remove: false})
	Jobstats.allow({insert: false, update: false, remove: false})
	Jobqueue.allow({insert: false, update: false, remove: false})
	Latestmessages.allow({insert: false, update: false, remove: false})
	Moves.allow({insert: false, update: false, remove: false})
	Battles.allow({insert: false, update: false, remove: false})

	Meteor.startup(function () {  
		Hexes._ensureIndex({x:1, y:1}, {unique:1})
		Castles._ensureIndex({user_id:1, x:1, y:1})
		Villages._ensureIndex({user_id:1, x:1, y:1})
		Armies._ensureIndex({x:1, y:1})
		Jobstats._ensureIndex({job_name:1})
		Notifications._ensureIndex({user_id:1, type:1})
		Battles._ensureIndex({x:1, y:1})
		Dailystats._ensureIndex({user_id:1})
		Threads._ensureIndex({forum_id:1})
		Messages._ensureIndex({thread_id:1})
		Moves._ensureIndex({army_id:1})
	})
}

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
