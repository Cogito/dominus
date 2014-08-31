Template.not_lost_vassal_loop.helpers({
	vars: function() {
		return this.vars
	}
})

Template.not_lost_vassal_loop.events({
	'click .not_lost_vassal_loop_goto': function() {
		center_on_hex(this.vars.x, this.vars.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.castle_id)
	}
})