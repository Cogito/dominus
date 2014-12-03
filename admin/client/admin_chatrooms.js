Template.adminChatrooms.helpers({
	chatrooms: function() {
		return Rooms.find().map(function(room) {
			room.numMembers = room.members.length
			return room
		})
	}
})