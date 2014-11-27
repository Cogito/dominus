Rooms = new Meteor.Collection('rooms')
Roomchats = new Meteor.Collection('roomchats')

if (Meteor.isServer) {
	Meteor.startup(function () {  
	  Rooms._ensureIndex({members:1, type:1})
	})
}