Rooms = new Meteor.Collection('rooms')
Roomchats = new Meteor.Collection('roomchats')

if (Meteor.isClient) {
	RoomMembers = new Mongo.Collection('room_members')
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



// TEMP
// remove this
// if (Meteor.isServer) {
// 	Meteor.users.find().forEach(function(user) {
// 		Meteor.users.update(user._id, {$set: {max_chatroom_height:500}})
// 	})
// }