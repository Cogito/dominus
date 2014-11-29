Rooms = new Meteor.Collection('rooms')
Roomchats = new Meteor.Collection('roomchats')
Recentchats = new Mongo.Collection('recentchats')


if (Meteor.isClient) {
	RoomMembers = new Mongo.Collection('room_members')

	// this is used for new chat notifications
	// need to keep a list of which rooms you are in
	Roomlist = new Mongo.Collection('room_list')
}

if (Meteor.isServer) {
	Meteor.startup(function () {  
	  Rooms._ensureIndex({members:1, type:1})
	  Roomchats._ensureIndex({room_id:1})
	})

	Rooms.allow({insert: false, update: false, remove: false})
	Roomchats.allow({insert: function(userId, doc) {
		if (doc.user_id == userId) {
			return true
		} else {
			return false
		} 
	}, update: false, remove: false})
}