Rooms = new Meteor.Collection('rooms')
Roomchats = new Meteor.Collection('roomchats')
Recentchats = new Mongo.Collection('recentchats')


if (Meteor.isClient) {
	RoomMembers = new Mongo.Collection('room_members')

	// this is used for new chat notifications
	// need to keep a list of which rooms you are in
	Roomlist = new Mongo.Collection('room_list')
}





// TEMP
// remove this
// if (Meteor.isServer) {
// 	Meteor.users.find().forEach(function(user) {
// 		Meteor.users.update(user._id, {$set: {max_chatroom_height:500}})
// 	})
// }