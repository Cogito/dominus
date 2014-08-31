Template.admin_commands.events({
	'click #update_allies_user_button': function(event, template) {
		var input = template.find('#update_allies_username_input')
		if ($(input).length > 0) {
			Meteor.call('admin_run_update_allies_username', $(input).val())
		}
	}
})