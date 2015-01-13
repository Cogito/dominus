Template.not_battle_results.helpers({
	vars: function() {
		return this.vars
	},

	results: function() {
		if (this.vars.dif < 0) {
			// defender wins
			return this.vars.d.username+"'s "+this.vars.d.type+" "+this.vars.d.name+" won."

		} else if (this.vars.dif > 0) {
			// attacker wins
			return this.vars.a.username+"'s "+this.vars.a.type+" "+this.vars.a.name+" won."

		} else if (this.vars.dif == 0) {
			// everyone loses
			return 'Battle had no survivors.'
		}
	},

	attacker_wins: function() {
		if (this.vars.dif > 0) {
			return true
		} else {
			return false
		}
	},

	defender_wins: function() {
		if (this.vars.dif < 0) {
			return true
		} else {
			return false
		}
	},

	no_survivors: function() {
		if (this.vars.dif == 0) {
			return true
		} else {
			return false
		}
	},

	is_village_destroyed: function() {
		if (this.vars.d.type == 'village' && this.vars.dif >= 0) {
			return true
		} else {
			return false
		}
	}
})


Template.not_battle_results.events({
	'click .not_goto_hex': function(event, template) {
		center_on_hex(this.vars.d.x, this.vars.d.y)

		if (this.vars.d.type == 'castle') {
			Session.set('selected_type', 'castle')
			Session.set('selected_id', this.vars.d._id)
		} else if (this.vars.d.type == 'village') {
			if (this.vars.dif < 0) {
				Session.set('selected_type', 'village')
				Session.set('selected_id', this.vars.d._id)
			} else {
				Session.set('selected_type', 'hex')
				Session.set('selected_id', this.vars.d.hex_id)
			}
		} else {
			Session.set('selected_type', 'hex')
			Session.set('selected_id', this.vars.d.hex_id)
		}
	},

	'click .not_goto_attacker': function(event, template) {
		center_on_hex(this.vars.a.castle_x, this.vars.a.castle_y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.a.castle_id)
	},

	'click .not_goto_defender': function(event, template) {
		center_on_hex(this.vars.d.castle_x, this.vars.d.castle_y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', this.vars.d.castle_id)
	}
})