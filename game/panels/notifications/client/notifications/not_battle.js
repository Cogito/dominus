Template.not_battle.helpers({
	vars: function() {
		return this.vars
	},

	greater_than_zero: function(num) {
		return num > 0
	},
})

Template.not_battle.events({
	'click .not_battle_goto_hex': function() {
		center_on_hex(this.vars.battle.defender.x, this.vars.battle.defender.y)
		Session.set('selected_type', 'hex')
		var id = coords_to_id(this.vars.battle.defender.x, this.vars.battle.defender.y, 'hex')
		Session.set('selected_id', id)
	}
})