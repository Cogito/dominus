Template.battle_report_unit.helpers({
	unit_type: function(name) {
		if (this.type == name) {
			return true
		}
		return false
	},

	won_this_round: function() {
		return this.dif > 0
	},

	hasAllies: function() {
		return this.allies.length > 0
	},

	icon_name: function() {
		if (this.isAttacker) {
			return 'fa-gavel'
		} else {
			return 'fa-shield'
		}

	}
})

Template.battle_report.helpers({
	conqueredEmptyCastle: function() {
		if (this.unit && typeof this.unit.dif == 'undefined') {
			return true
		}
	},

	next_fight_in: function() {
		Session.get('refresh_time_field')
		var time = moment(new Date(this.updated_at)).add(s.battle_interval, 'ms')
		if (time.isAfter(moment(new Date()))) {
			return moment(new Date(this.updated_at)).add(s.battle_interval, 'ms').fromNow()
		} else {
			return null
		}

	},

	roundData: function() {
		data = _.sortBy(this.roundData, function(d) {
			return d.roundNumber * -1
		})
		return data
	},

	winnersLastRound: function() {
		var data = this.roundData[this.roundData.length-1]
		if (data) {
			return _.filter(this.roundData[this.roundData.length-1].units, function(unit) {
				return unit.dif > 0
			})
		}
	},

	lostLastRound: function() {
		var data = this.roundData[this.roundData.length-1]
		if (data) {
			return _.filter(this.roundData[this.roundData.length-1].units, function(unit) {
				return unit.dif < 0
			})
		}
	}
})

Template.battle_report.events({
	'click .battle_report_goto_user': function(event, template) {
		Session.set('selected_type', 'castle')

		if (this.type == 'castle') {
			center_on_hex(this.x, this.y)
			Session.set('selected_id', this._id)
		} else {
			center_on_hex(this.castle_x, this.castle_y)
			Session.set('selected_id', this.castle_id)
		}
	},

	'click .battle_report_goto_hex': function() {
		center_on_hex(this.x, this.y)
		Session.set('selected_type', 'hex')
		var id = coords_to_id(this.x, this.y, 'hex')
		Session.set('selected_id', id)
	}
})
