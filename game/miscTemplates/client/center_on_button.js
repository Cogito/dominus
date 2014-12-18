Template.center_on_button.events({
	'click .select_button': function(event, template) {
		check(template.data.selected_type, String)
		check(template.data.selected_id, String)
		Session.set('selected_type', template.data.selected_type)
		Session.set('selected_id', template.data.selected_id)
	},

	'click .center_on_button': function(event, template) {
		check(template.data.x, validNumber)
		check(template.data.y, validNumber)
		center_on_hex(template.data.x,template.data.y)
	}
})