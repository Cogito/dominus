Template.not_gained_vassal.helpers({
	vars: function() {
		return this.vars
	},

	is_direct_vassal: function() {
		if (this.vars && this.vars.vassals_new_lord) {
			return this.vars.vassals_new_lord._id == Meteor.userId()
		}
	}
})

Template.not_gained_vassal.events({
	'click .not_gained_vassal_goto': function() {
		center_on_hex(this.vars.new_vassal.x, this.vars.new_vassal.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.new_vassal.castle_id)
	},

	'click .not_gained_vassal_goto_lord': function() {
		center_on_hex(this.vars.vassals_new_lord.x, this.vars.vassals_new_lord.y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.vassals_new_lord.castle_id)
	}
})