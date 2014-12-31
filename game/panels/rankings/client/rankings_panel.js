var subs = new ReadyManager()

var loadingArray = function() {
	var ret = []
	for (var x=0; x<s.rankings.perPage; x++) {
		ret.push({username:'loading', is_me:false, x:'', y:'', castle_id:''})
	}
	return ret
}

Template.rankings_panel.helpers({
	startVassalCounterAt: function() {
		return (Template.instance().vassalsPage.get()-1) * s.rankings.perPage
	},

	startNetworthCounterAt: function() {
		return (Template.instance().networthPage.get()-1) * s.rankings.perPage
	},

	startIncomeCounterAt: function() {
		return (Template.instance().incomePage.get()-1) * s.rankings.perPage
	},

	startLostSoldiersCounterAt: function() {
		return (Template.instance().lostSoldiersPage.get()-1) * s.rankings.perPage
	},

	startVillageCounterAt: function() {
		return (Template.instance().villagesPage.get()-1) * s.rankings.perPage
	},

	top10_networth: function() {
		if (subs.ready('net') && subs.ready('playerCount')) {
			return RankingsNetworth.find({}, {sort: {networth: -1}}).map(function(u) {
				if (u._id == Meteor.userId()) {
					u.is_me = true
				} else {
					u.is_me = false
				}
				return u
			})
		} else {
			return loadingArray()
		}
	},

	top10_income: function() {
		if (subs.ready('inc') && subs.ready('playerCount')) {
			return RankingsIncome.find({}, {sort: {income: -1}}).map(function(u) {
				if (u._id == Meteor.userId()) {
					u.is_me = true
				} else {
					u.is_me = false
				}
				return u
			})
		} else {
			return loadingArray()
		}
	},

	top10_allies: function() {
		if (subs.ready('ally') && subs.ready('playerCount')) {
			return RankingsAllies.find({}, {sort: {num_allies_below: -1}}).map(function(u) {
				if (u._id == Meteor.userId()) {
					u.is_me = true
				} else {
					u.is_me = false
				}
				return u
			})
		} else {
			return loadingArray()
		}
	},

	top10_losses: function() {
		if (subs.ready('loss') && subs.ready('playerCount')) {
			return RankingsLostSoldiers.find({}, {sort: {losses_worth: -1}}).map(function(u) {
				if (u._id == Meteor.userId()) {
					u.is_me = true
				} else {
					u.is_me = false
				}
				return u
			})
		} else {
			return loadingArray()
		}
	},

	dominus: function() {
		if (subs.ready('dominus')) {
			return RankingsDominus.findOne()
		}
	},

	top10_villages: function() {
		if (subs.ready('villageRanks')) {
			return RankingsVillages.find({}, {sort: {"income.worth": -1}}).map(function(u) {
				if (u._id == Meteor.userId()) {
					u.is_me = true
				} else {
					u.is_me = false
				}
				return u
			})
		} else {
			return loadingArray()
		}
	},
})


Template.rankings_panel.events({
	'click .gotoUserButton': function(event, template) {
		event.preventDefault()
		event.stopPropagation()

		var id = $(event.currentTarget).attr('data-castle_id')
		var x = parseInt($(event.currentTarget).attr('data-x'))
		var y = parseInt($(event.currentTarget).attr('data-y'))

		center_on_hex(x, y)
		Session.set('selected_type', 'castle')
		Session.set('selected_id', id)
	},

	'click .previousButton': function(event, template) {
		event.preventDefault()
		event.stopPropagation()

		var type = event.currentTarget.dataset.type
		if (Template.instance()[type].get() > 1) {
			Template.instance()[type].set(Template.instance()[type].get()-1)
		}
	},

	'click .nextButton': function(event, template) {
		event.preventDefault()
		event.stopPropagation()

		var type = event.currentTarget.dataset.type
		if (type == 'villagesPage') {
			if (Template.instance()[type].get() < Template.instance().villageCount.get() / s.rankings.perPage) {
				Template.instance()[type].set(Template.instance()[type].get()+1)
			}
		} else {
			if (Template.instance()[type].get() < Template.instance().playerCount.get() / s.rankings.perPage) {
				Template.instance()[type].set(Template.instance()[type].get()+1)
			}
		}

	}
})


Template.rankings_panel.created = function() {
	var self = this

	self.vassalsPage = new ReactiveVar(1)
	self.networthPage = new ReactiveVar(1)
	self.incomePage = new ReactiveVar(1)
	self.lostSoldiersPage = new ReactiveVar(1)
	self.villagesPage = new ReactiveVar(1)

	self.autorun(function() {
		subs.subscriptions([
		{
			groupName: 'net',
			subscriptions: [ Meteor.subscribe('networth_rankings', self.networthPage.get()).ready() ]
		},
		{
			groupName: 'ally',
			subscriptions: [ Meteor.subscribe('ally_rankings', self.vassalsPage.get()).ready() ]
		},
		{
			groupName: 'inc',
			subscriptions: [ Meteor.subscribe('income_rankings', self.incomePage.get()).ready() ]
		},
		{
			groupName: 'loss',
			subscriptions: [ Meteor.subscribe('losses_rankings', self.lostSoldiersPage.get()).ready() ]
		},
		{
			groupName: 'playerCount',
			subscriptions: [
				Meteor.subscribe('playerCount').ready(),
				Meteor.subscribe('findPlayerCount').ready()
			]
		},{
			groupName: 'villageRanks',
			subscriptions: [
				Meteor.subscribe('village_rankings', self.villagesPage.get()).ready(),
				Meteor.subscribe('villageCount').ready(),
				Meteor.subscribe('findVillageCount').ready()
			]
		}, {
			groupName: 'dominus',
			subscriptions: [
				Meteor.subscribe('dominus_rankings').ready()
			]
		}])
	})

	self.playerCount = new ReactiveVar(0)
	this.autorun(function() {
		var playerCount = Settings.findOne({name:'playerCount'})
		if (playerCount) {
			self.playerCount.set(playerCount.value)
		}
	})

	self.villageCount = new ReactiveVar(0)
	this.autorun(function() {
		var villageCount = Settings.findOne({name:'villageCount'})
		if (villageCount) {
			self.villageCount.set(villageCount.value)
		}
	})
}


Template.rankings_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}
