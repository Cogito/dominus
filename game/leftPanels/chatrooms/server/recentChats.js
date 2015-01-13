// if a room is deleted clean up recent chats
Meteor.startup(function() {
	Rooms.find({}, {fields: {_id:1}}).observe({
		remove: function(room) {
			Recentchats.remove({room_id:room._id})
		}
	})
})