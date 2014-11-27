Template.chatroom.helpers({
	numPeople: function() {
		return this.members.length
	},

	leaveChatroomConfirmDisplay: function() {
		if (this.showLeaveConfirm.get()) {
			return 'block'
		} else {
			return 'none'
		}
	}
})


Template.chatroom.events({
	'click .leaveChatroomButton': function(event, template) {
		template.data.showLeaveConfirm.set(!template.data.showLeaveConfirm.get())
	},

	'click .chatroomLeaveNoButton': function(event, template) {
		template.data.showLeaveConfirm.set(false)
	},

	'click .chatroomLeaveYesButton': function(event, template) {
		Meteor.call('leaveChatroom', template.data._id)
	}
})


Template.chatroom.created = function() {
	this.data.showLeaveConfirm = new ReactiveVar(false)
}