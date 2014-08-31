Template.not_now_a_king.helpers({
	vars: function() {
		return this.vars
	}
})

Template.not_now_a_king.events({
	'click .now_a_king_goto': function() {
		center_on_hex(this.vars.x, this.vars.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.castle_id)
	}
})