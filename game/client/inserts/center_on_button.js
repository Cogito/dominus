Template.center_on_button.events({
	'click .select_button': function(event, template) {
		check(this.selected_type, String)
		check(this.selected_id, String)
		Session.set('selected_type', this.selected_type)
		Session.set('selected_id', this.selected_id)
	},

	'click .center_on_button': function(event, template) {
		check(this.x, Number)
		check(this.y, Number)
		center_on_hex(this.x,this.y)
	}
})