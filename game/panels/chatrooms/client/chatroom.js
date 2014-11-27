Template.chatroom.helpers({
	openChatroom: function() {
		return Session.get('selectedChatroomId') == this._id
	},

	numPeople: function() {
		return this.members.length
	},

	showLeaveConfirm: function() {
		return Template.instance().showLeaveConfirm.get() ? 'block' : 'none'
	},

	showInviteBox: function() {
		return Template.instance().showInviteBox.get() ? 'block' : 'none'
	},

	showRenameBox: function() {
		return Template.instance().showRenameBox.get() ? 'block' : 'none'
	},
})


Template.chatroom.events({
	'click .openChatroomButton': function(event, template) {
		if (Session.get('selectedChatroomId') == template.data._id) {
			Session.set('selectedChatroomId', null)
		} else {
			Session.set('selectedChatroomId', template.data._id)
		}
	},

	'click .leaveChatroomButton': function(event, template) {
		template.showLeaveConfirm.set(!template.showLeaveConfirm.get())
	},

	'click .chatroomLeaveNoButton': function(event, template) {
		template.showLeaveConfirm.set(false)
	},

	'click .chatroomLeaveYesButton': function(event, template) {
		Meteor.call('leaveChatroom', template.data._id)
	},

	'click .renameButton': function(event, template) {
		template.showRenameBox.set(!template.showRenameBox.get())
	},

	'click .renameCancelButton': function(event, template) {
		template.showRenameBox.set(false)
	},

	'click .renameSaveButton': function(event, template) {
		var name = template.find('.renameInput')
		var errorAlert = template.find('.renameErrorAlert')
		var button = event.currentTarget
		var button_html = $(button).html()

		$(errorAlert).hide()

		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		Meteor.call('renameChatroom', template.data._id, $(name).val(), function(error, result) {
			$(button).attr('disabled', false)
			$(button).html(button_html)

			if (error) {
				$(errorAlert).show()
				$(errorAlert).html(error.error)
			} else {
				template.showRenameBox.set(false)
			}
		})
	},

	'click .inviteButton': function(event, template) {
		template.showInviteBox.set(!template.showInviteBox.get())
	},

	'click .inviteCancelButton': function(event, template) {
		template.showInviteBox.set(false)
	},

	'click .inviteSaveButton': function(event, template) {
		var name = template.find('.inviteInput')
		var errorAlert = template.find('.inviteErrorAlert')
		var button = event.currentTarget
		var button_html = $(button).html()

		$(errorAlert).hide()

		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		Meteor.call('inviteToChatroom', template.data._id, $(name).val(), function(error, result) {
			$(button).attr('disabled', false)
			$(button).html(button_html)

			if (error) {
				$(errorAlert).show()
				$(errorAlert).html(error.error)
			} else {
				$(name).val('')
				template.showInviteBox.set(false)
			}
		})
	}
})


Template.chatroom.created = function() {
	this.showLeaveConfirm = new ReactiveVar(false)
	this.showRenameBox = new ReactiveVar(false)
	this.showInviteBox = new ReactiveVar(false)
}