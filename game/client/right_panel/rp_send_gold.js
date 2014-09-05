Template.rp_send_gold.helpers({
	username: function() {
		var castle = Castles.findOne(Session.get('selected_id'))
		return castle.username
	}
})


Template.rp_send_gold.events({
	'input #how_much_input': function(event, template) {
		var input = template.find('#how_much_input')
		var alert = template.find('#send_gold_error_alert')
		var submit_button = template.find('#send_gold_submit_button')

		var num = Number($(input).val())

		var error = false
		$(submit_button).prop('disabled', false)
		$(alert).hide()

		if (isNaN(num)) {
			error = true
			$(alert).show()
			$(alert).html('Enter a number')
			$(submit_button).prop('disabled', true)
		}

		if (!error && num < 0) {
			$(alert).show()
			$(alert).html('Number must be greater than 0')
			$(submit_button).prop('disabled', true)
		}

		if (!error && num > get_user_property("gold")) {
			$(alert).show()
			$(alert).html('You do not have enough gold')
			$(submit_button).prop('disabled', true)
		}
	},

	'click #send_gold_cancel_button': function(event, template) {
		Session.set('rp_template', 'rp_info_castle')
	},

	'click #send_gold_submit_button': function(event, template) {
		var input = template.find('#how_much_input')
		var num = Number($(input).val())

		var button_html = $('#send_gold_submit_button').html()
		$('#send_gold_submit_button').attr('disabled', true)
		$('#send_gold_submit_button').html('Please Wait')

		var castle = Castles.findOne(Session.get('selected_id'))

		Meteor.apply('send_gold_to', [castle.user_id, num], {wait:true, onResultReceived: function(error, result) {
			$('#send_gold_submit_button').attr('disabled', false)
			$('#send_gold_submit_button').html(button_html)
			
			logevent('right_panel', 'complete', 'send_gold')

			Session.set('rp_template', 'rp_info_castle')
		}})
	}
})