Hexes.allow({insert: false, update: false, remove: false})
Castles.allow({insert: false, update: false, remove: false})
Armies.allow({insert: false, update: false, remove: false})
Market.allow({insert: false, update: false, remove: false})
Villages.allow({insert: false, update: false, remove: false})
Notifications.allow({insert: false, update: false, remove: false})
Dailystats.allow({insert: false, update: false, remove: false})
Markethistory.allow({insert: false, update: false, remove: false})
Chatrooms.allow({insert: false, update: false, remove: false})
Chats.allow({insert: function(userId, doc) {
	if (doc.user_id == userId) {
		return true
	} else {
		return false
	} 
}, update: false, remove: false})
Forums.allow({insert: false, update: false, remove: false})
Threads.allow({insert: false, update: false, remove: false})
Messages.allow({insert: false, update: false, remove: false})
//Meteor.users.deny({update: function () { return true; }})
Meteor.users.allow({insert: false, update: false, remove: false})
Charges.allow({insert: false, update: false, remove: false})
Gamestats.allow({insert: false, update: false, remove: false})
Jobstats.allow({insert: false, update: false, remove: false})
Jobqueue.allow({insert: false, update: false, remove: false})
Latestchats.allow({insert: function(userId, doc) { return true }, update: function(userId, doc) { return true }, remove: false})
Latestmessages.allow({insert: false, update: false, remove: false})
Moves.allow({insert: false, update: false, remove: false})
Battles.allow({insert: false, update: false, remove: false})