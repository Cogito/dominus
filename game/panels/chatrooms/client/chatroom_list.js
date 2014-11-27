Template.chatroom_list.helpers({
	selectedChatroom: function() {
		return Session.get('selectedChatroomId') == this._id
	},

	numPeople: function() {
		return this.members.length
	}
})



Template.chatroom_list.events({
	'click .openChatroomButton': function(event, template) {
		if (Session.get('selectedChatroomId') == template.data._id) {
			Session.set('selectedChatroomId', null)
		} else {
			Session.set('selectedChatroomId', template.data._id)
		}
	},
})