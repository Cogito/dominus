Template.not_new_vassal.helpers({
	vars: function() {
		return this.vars
	},

	vassal_tax: function() {
		return s.vassal_tax * 100
	}
})

Template.not_new_vassal.events({
	'click .not_not_new_vassal_goto': function() {
		center_on_hex(this.vars.x, this.vars.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.castle_id)
	}
})