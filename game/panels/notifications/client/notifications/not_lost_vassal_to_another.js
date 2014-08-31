Template.not_lost_vassal_to_another.helpers({
	vars: function() {
		return this.vars
	}
})

Template.not_lost_vassal_to_another.events({
	'click .lost_vassal_to_another_goto_vassal': function() {
		center_on_hex(this.vars.lost_vassal.x, this.vars.lost_vassal.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.lost_vassal.castle_id)
	},

	'click .lost_vassal_to_another_goto_lord': function() {
		center_on_hex(this.vars.vassals_new_lord.x, this.vars.vassals_new_lord.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.vassals_new_lord.castle_id)
	},
})