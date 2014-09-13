Template.settings_panel.helpers({
	username: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1}})
		if (user) {
			return user.username
		}
	}
})

Template.settings_panel.events({
	'click #toggle_coords_button': function(event, template) {
		if (get_user_property("sp_show_coords")) {
			Meteor.call('hide_coords')
		} else {
			Meteor.call('show_coords')
		}
	},

	'click #toggle_minimap_button': function(event, template) {
		if (get_user_property("sp_show_minimap")) {
			Meteor.call('hide_minimap')
		} else {
			Meteor.call('show_minimap')
		}
	},

	'click #change_username_button': function(event, template) {
		var input = template.find('#change_username_input')
		var button = template.find('#change_username_button')
		var alert = template.find('#change_username_alert')

		var error = false
		var msg = ''
		$(alert).hide()
		var username = $(input).val()

		username = _.clean(username)
		username = username.replace(/\W/g, '')

		if (username.length < 3) {
			error = true
			msg = 'Username must be at least 3 characters long.'
		}

		if (username.length > 30) {
			error = true
			msg = 'New username is too long.'
		}

		if (error) {
			$(alert).show()
			$(alert).html(msg)
		} else {
			var button_html = $(button).html()
			$(button).attr('disabled', true)
			$(button).html('Please Wait')

			Meteor.apply('change_username', [username], {wait:false, onResultReceived:function(error, result){
				if (result) {
					if (result.result) {
						$(input).val(username)
					} else {
						$(alert).show()
						$(alert).html(result.msg)
					}
				}
				$(button).attr('disabled', false)
				$(button).html(button_html)
			}})
		}
	},

	'click #delete_account_button': function(event, template) {
		var button = template.find('#change_username_button')
	},

	'click #deleteAccountButton': function(event, template) {
		var confirmCont = template.find('#deleteAccountConfirmationContainer')
		var butCont = template.find('#deleteAccountButtonContainer')

		$(butCont).hide()
		$(confirmCont).slideDown(100)
	},

	'click #deleteAccountCancelButton': function(event, template) {
		var confirmCont = template.find('#deleteAccountConfirmationContainer')
		var butCont = template.find('#deleteAccountButtonContainer')

		$(butCont).slideDown(100)
		$(confirmCont).hide()
	},

	'click #deleteAccountConfirmButton': function(event, template) {
		Meteor.call('deleteAccount')
	}
})

Template.settings_panel.rendered = function() {
	logevent('panel', 'open', 'settings')
}