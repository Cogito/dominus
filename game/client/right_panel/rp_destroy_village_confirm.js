Template.rp_destroy_village_confirm.events({
	'click #destroy_village_button_yes': function(event, template) {
		logevent('right_panel', 'complete', 'destroy_village')
		$('#destroy_village_button_yes').attr('disabled', true)
		$('#destroy_village_button_yes').html('Please Wait')
		var id = Session.get('selected_id')
		deselect_all()
		remove_village_highlights()
		Meteor.call('destroy_village', id)
	},

	'click #destroy_village_button_no': function(event, template) {
		Session.set('rp_template', 'rp_info_village')
	},
})


Template.rp_destroy_village_confirm.rendered = function() {
	Session.set('mouse_mode', 'modal')
}