Template.rp_edit_name.events({
	'click #edit_name_button': function(event, template) {
		var name = template.find('#edit_name_input')
		var alert = template.find('#edit_name_error_alert')

		$(alert).hide()

		var error = false

		if ($(name).val().length == 0) {
			$(alert).show()
			$(alert).html('Name is too short.')
			error = true
		}

		if ($(name).val().length > 30) {
			$(alert).show()
			$(alert).html('Name is too long.')
			error = true
		}

		if (!error) {
			var button_html = $('#edit_name_button').html()
			$('#edit_name_button').attr('disabled', true)
			$('#edit_name_button').html('Please Wait')

			Meteor.apply('edit_name', [Session.get('selected_type'), Session.get('selected_id'), $(name).val()], {wait:false, onResultReceived:function(error, result) {
				$('#edit_name_button').attr('disabled', false)
				$('#edit_name_button').html(button_html)

				logevent('right_panel', 'complete', 'edit_name')

				if (result) {
					switch(Session.get('selected_type')) {
						case 'castle':
							Session.set('rp_template', 'rp_info_castle')
							break;
						case 'village':
							Session.set('rp_template', 'rp_info_village')
							break;
						case 'army':
							Session.set('rp_template', 'rp_info_army')
							break;
					}
				} else {
					$(alert).show()
					$(alert).html('Error saving name.')
				}
			}})	
		}
		
	},


	'click #edit_name_cancel_button': function(event, template) {
		switch(Session.get('selected_type')) {
			case 'castle':
				Session.set('rp_template', 'rp_info_castle')
				break;
			case 'village':
				Session.set('rp_template', 'rp_info_village')
				break;
			case 'army':
				Session.set('rp_template', 'rp_info_army')
				break;
		}
	},

})