Template.rp_send_gold.helpers({
	username: function() {
		var castle = Castles.findOne(Session.get('selected_id'), {fields: {username:1}})
		if (castle) {
			return castle.username
		}
	}
})


Template.rp_send_gold.events({
	'click #send_gold_cancel_button': function(event, template) {
		Session.set('rp_template', 'rp_info_castle')
	},

	'click #send_gold_submit_button': function(event, template) {
		var input = template.find('#how_much_input')
		var button = template.find('#send_gold_submit_button')
		var alert = template.find('#send_gold_error_alert')
		var button_html = $('#send_gold_submit_button').html()

		$(alert).hide()
		$(button).attr('disabled', true)
		$(button).html('Please Wait')

		var castle = Castles.findOne(Session.get('selected_id'), {fields: {user_id:1}})

		Meteor.call('send_gold_to', castle.user_id, $(input).val(), function(error, result) {
			$(button).attr('disabled', false)
			$(button).html(button_html)

			if (error) {
				$(alert).show()
				$(alert).html(error.error)
			} else {
				Session.set('rp_template', 'rp_info_castle')
			}
		})
	}
})