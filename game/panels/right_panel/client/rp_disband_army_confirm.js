Template.rp_disband_army_confirm.events({
	'click #disband_army_button_yes': function(event, template) {
		$('#disband_army_button_yes').attr('disabled', true)
		$('#disband_army_button_yes').html('Please Wait')
		remove_all_highlights()
		deselect_all()
		Meteor.call('disband_army', Session.get('selected_id'))
	},

	'click #disband_army_button_no': function(event, template) {
		Session.set('rp_template', 'rp_info_army')
	},
})


Template.rp_disband_army_confirm.created = function() {
	Session.set('mouse_mode', 'modal')
}