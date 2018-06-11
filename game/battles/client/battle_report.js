Template.battle_report.helpers({
	next_fight_in: function() {
		Session.get('refresh_time_field')
		var time = moment(new Date(this.updated_at)).add(s.battle_interval, 'ms')
		if (time.isAfter(moment(new Date()))) {
			return moment(new Date(this.updated_at)).add(s.battle_interval, 'ms').fromNow()
		} else {
			return null
		}
	},

	castle: function() {
		if (this) {
			return AlertCastles.findOne(this.castle_id)
		}
	},

	castleTakenBy: function() {
		if (this) {
			return AlertArmies.findOne(this.castleTakenByArmy_id)
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
		var self = this
		Meteor.call('coords_to_id', self.x, self.y, 'hex', function(error, hexId) {
			if (!error && hexId) {
				center_on_hex(self.x, self.y);
				Session.set('selected_type', 'hex');
				Session.set('selected_id', hexId);
				Session.set('selected_coords', {x:self.x, y:self.y})
			}
		});
	},
})




Template.battle_report.created = function() {
	var self = this

	self.subs = new ReadyManager()

	self.autorun(function() {
		if (Template.currentData()) {
			self.subs.subscriptions([{
				groupName: 'fighttitles',
				subscriptions: [ Meteor.subscribe('fighttitles', Template.currentData()._id).ready() ]
			}, {
				groupName: 'lastFight',
				subscriptions: [ Meteor.subscribe('lastFightInBattle', Template.currentData()._id).ready() ]
			}])

			if (Template.currentData().castleWasTaken) {
				Meteor.subscribe('alertCastle', Template.currentData().castle_id)
				Meteor.subscribe('alertArmy', Template.currentData().castleTakenByArmy_id)
			}
		}
	})
}
