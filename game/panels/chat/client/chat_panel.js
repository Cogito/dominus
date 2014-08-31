Template.chat_panel.helpers({
	chatrooms: function() {
		return Chatrooms.find({}, {sort: {created_at: 1}})
	},
})


Template.chat_panel.events({
	'click #chat_start_with_button': function(event, template) {
		var name = template.find('#chat_start_with_name')
		var alert = template.find('#chat_error_alert')
		var success_alert = template.find('#chat_success_alert')

		var error = false
		$(alert).hide()
		$(success_alert).hide()

		if ($(name).val().length == 0) {
			error = true
			$(alert).show()
			$(alert).html("Enter someone's name then click the button.")
		}

		if (!error) {
			var button_html = $('#chat_start_with_button').html()
			$('#chat_start_with_button').attr('disabled', true)
			$('#chat_start_with_button').html('Please Wait')

			Meteor.call('start_chat_with', $(name).val(), function(error, result) {
				$('#chat_start_with_button').attr('disabled', false)
				$('#chat_start_with_button').html(button_html)

				if (error) {
					$(alert).show()
					$(alert).html("Error creating chatroom.")
				} else {
					if (result) {
						logevent('chat', 'create_chatroom')
						$(success_alert).show()
						$(success_alert).html("Chatroom created.")
					} else {
						$(alert).show()
						$(alert).html("Could not find a user by that name.")
					}
				}
			})
		}
	},

	// same as click button
	'keyup #chat_start_with_name': function(event, template) {
		if (event.keyCode === 13) {
			var name = template.find('#chat_start_with_name')
			var alert = template.find('#chat_error_alert')
			var success_alert = template.find('#chat_success_alert')

			var error = false
			$(alert).hide()
			$(success_alert).hide()

			if ($(name).val().length == 0) {
				error = true
				$(alert).show()
				$(alert).html("Enter someone's name then click the button.")
			}

			if (!error) {
				var button_html = $('#chat_start_with_button').html()
				$('#chat_start_with_button').attr('disabled', true)
				$('#chat_start_with_button').html('Please Wait')

				Meteor.apply('start_chat_with', [$(name).val()], {wait:false, onResultReceived: function(error, result) {
					$('#chat_start_with_button').attr('disabled', false)
					$('#chat_start_with_button').html(button_html)

					if (error) {
						$(alert).show()
						$(alert).html("Error creating chatroom.")
					} else {
						if (result) {
							logevent('chat', 'create_chatroom')
							$(success_alert).show()
							$(success_alert).html("Chatroom created.")
						} else {
							$(alert).show()
							$(alert).html("Could not find a user by that name.")
						}
					}
				}})
			}
		}
	}
})





Template.chat_panel.rendered = function() {
	
	// subscribe
	this.deps_subscribe = Deps.autorun(function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {chatrooms:1}})
		if (user) {
			Meteor.subscribe('my_chatrooms', user.chatrooms)
		}
	})

	// on window gain focus, if a chatroom is open hide alert
	$(window).focus(function(event) {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {chatrooms:1}, reactive:false})
		_.each(user.chatrooms, function(room_id) {
			if (Session.get('room_'+room_id+'_open')) {
				Cookie.set('room_'+room_id+'_open', new Date(), {years: 10})
			}
		})
	})

	logevent('panel', 'open', 'chat')
}

Template.chat_panel.destroyed = function() {
	if (this.deps_subscribe) {
		this.deps_subscribe.stop()
	}

	$(window).unbind('focus')
}