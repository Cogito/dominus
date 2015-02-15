Template.adminChatrooms.helpers({
	chatrooms: function() {
		return Rooms.find().map(function(room) {
			room.numMembers = room.members.length
			return room
		})
	},
})


Template.adminChatrooms.events({
	'click .openRoomButton': function(event, template) {
		event.preventDefault()
		var roomId = event.currentTarget.getAttribute('data-id')
		Template.instance().openRoomId.set(roomId)
	}
})


Template.adminChatrooms.created = function() {
	var self = this
	self.openRoomId = new ReactiveVar(null)

	self.autorun(function() {
		var roomId = self.openRoomId.get()
		if (roomId) {
			Meteor.subscribe('roomchats', roomId)

			var room = Rooms.findOne(self.openRoomId.get())
			if (room) {
				Meteor.subscribe('room_members', room.members)
			}

		}
	})
}
