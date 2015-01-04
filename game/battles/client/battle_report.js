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

	fightTitles: function() {
		return Fighttitles.find({battle_id:this._id}, {sort:{roundNumber:-1}})
	},

	winnersLastRound: function() {
		var lastFight = Fights.findOne({battle_id:this._id}, {sort:{roundNumber:-1}})
		if (lastFight) {
			return _.filter(lastFight.units, function(unit) {
				return unit.dif > 0
			})
		}
	},

	lostLastRound: function() {
		var lastFight = Fights.findOne({battle_id:this._id}, {sort:{roundNumber:-1}})
		if (lastFight) {
			return _.filter(lastFight.units, function(unit) {
				return unit.dif < 0
			})
		}
	}
})


Template.battle_report.events({
	'click .battle_report_goto_hex': function() {
		center_on_hex(this.x, this.y)
		Session.set('selected_type', 'hex')
		var id = coords_to_id(this.x, this.y, 'hex')
		Session.set('selected_id', id)
	},
})




Template.battle_report.created = function() {
	var self = this

	self.subs = new ReadyManager()

	self.autorun(function() {
		self.subs.subscriptions([{
			groupName: 'fighttitles',
			subscriptions: [ Meteor.subscribe('fighttitles', Template.currentData()._id).ready() ]
		}, {
			groupName: 'lastFight',
			subscriptions: [ Meteor.subscribe('lastFightInBattle', Template.currentData()._id).ready() ]
		}])
	})
}
