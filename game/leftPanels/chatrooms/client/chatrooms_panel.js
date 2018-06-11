Template.chatrooms_panel.helpers({
	chatroomSubscriptionsReady: function() {
		return Template.instance().chatroomSubscriptionsReady.get()
	},

	normalChatrooms: function() {
		return Rooms.find({type:'normal'})
	},

	kingChatrooms: function() {
		return Rooms.find({type:'king'})
	},

	everyoneChatrooms: function() {
		return Rooms.find({type:'everyone'})
	},

	selectedChatroom: function() {
		var selected_id = Session.get('selectedChatroomId')
		if (selected_id) {
			return Rooms.findOne(selected_id)
		}
	}
})


Template.chatrooms_panel.events({
	'click #chat_start_with_button': function(event, template) {
		event.preventDefault()

		var name = template.find('#chat_start_with_name')
		var error_alert = template.find('#chat_error_alert')
		var success_alert = template.find('#chat_success_alert')

		var error = false
		$(error_alert).hide()
		$(success_alert).hide()

		if ($(name).val().length == 0) {
			error = true
			$(error_alert).show()
			$(error_alert).html("Enter someone's name then click the button.")
		}

		if (!error) {
			var button_html = $('#chat_start_with_button').html()
			$('#chat_start_with_button').attr('disabled', true)
			$('#chat_start_with_button').html('Please Wait')

			Meteor.call('startChatroomWith', $(name).val(), function(error, result) {
				$('#chat_start_with_button').attr('disabled', false)
				$('#chat_start_with_button').html(button_html)

				if (error) {
					$(error_alert).show()
					$(error_alert).html(error.error)
				} else {
					if (result) {
						$(success_alert).show()
						$(success_alert).html("Chatroom created.")
						Session.set('selectedChatroomId', result)
						$(name).val('')
					} else {
						$(error_alert).show()
						$(error_alert).html("Could not find a user by that name.")
					}
				}
			})
		}
	}
})



Template.chatrooms_panel.created = function() {
	var self = this

	Session.set('selectedChatroomId', null)

	self.chatroomSubscriptionsReady = new ReactiveVar(false)
	this.autorun(function() {
		var normalChatroomsHandle = Meteor.subscribe('myNormalChatrooms')
		var kingChatroomsHandle = Meteor.subscribe('myKingChatrooms')
		var everyoneChatroomHandle = Meteor.subscribe('everyoneChatroom')

		if (normalChatroomsHandle.ready() && kingChatroomsHandle.ready() && everyoneChatroomHandle.ready()) {
			self.chatroomSubscriptionsReady.set(true)
		} else {
			self.chatroomSubscriptionsReady.set(false)
		}
	})
}


Template.chatrooms_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation

	// on window gain focus, if a chatroom is open hide alert
	$(window).focus(function(event) {
		var room_id = Session.get('selectedChatroomId')
		if (room_id) {
			var date = new Date(TimeSync.serverTime(null, 5000))
			Cookie.set('room_'+room_id+'_open', date, {years: 10})
		}
	})
}
