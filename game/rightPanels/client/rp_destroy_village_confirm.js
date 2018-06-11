Template.rp_destroy_village_confirm.events({
	'click #destroy_village_button_yes': function(event, template) {
		$('#destroy_village_button_yes').attr('disabled', true)
		$('#destroy_village_button_yes').html('Please Wait')
		Meteor.call('destroy_village', Session.get('selected_id'), function(error, result) {
			if (!error && result) {
				Session.set('selected_type', 'army')
				Session.set('selected_id', result)
			}
		})
		deselect_all()
		remove_village_highlights()
	},

	'click #destroy_village_button_no': function(event, template) {
		Session.set('rp_template', 'rp_info_village')
	},
})


Template.rp_destroy_village_confirm.created = function() {
	Session.set('mouse_mode', 'modal')
}