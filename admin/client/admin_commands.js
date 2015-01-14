Template.adminCommands.events({
	'click #update_allies_user_button': function(event, template) {
		var input = template.find('#update_allies_username_input')
		if ($(input).length > 0) {
			Meteor.call('admin_run_update_allies_username', $(input).val())
		}
	},

	'click #cleanupAllKingChatroomsButton': function(event, template) {
		Meteor.call('admin_cleanupAllKingChatrooms')
	},

	'click #bakeMapButton': function(event, template) {
		Meteor.call('admin_bakeMap')
	},

	'click #deleteUserButton': function(event, template) {
		var input = template.find('#deleteUserInput')
		Meteor.call('deleteAccount', $(input).val())
	}
})
