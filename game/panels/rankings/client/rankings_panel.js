var loadingArray = function() {
	var ret = []
	for (var x=0; x<s.rankings.perPage; x++) {
		ret.push({username:'', is_me:false, x:'', y:'', castle_id:''})
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
		if (Template.instance().networthLoaded.get()) {
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
		if (Template.instance().incomeLoaded.get()) {
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
		if (Template.instance().allyLoaded.get()) {
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
		if (Template.instance().lossesLoaded.get()) {
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
		return RankingsDominus.findOne()
	},

	top10_villages: function() {
		if (Template.instance().villageLoaded.get()) {
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

	self.networthLoaded = new ReactiveVar(false)
	self.allyLoaded = new ReactiveVar(false)
	self.incomeLoaded = new ReactiveVar(false)
	self.lossesLoaded = new ReactiveVar(false)
	self.villageLoaded = new ReactiveVar(false)

	this.autorun(function() {
		Meteor.subscribe('dominus_rankings')
	})

	this.autorun(function() {

		var netHandle = Meteor.subscribe('networth_rankings', self.networthPage.get())
		var allyHandle = Meteor.subscribe('ally_rankings', self.vassalsPage.get())
		var incomeHandle = Meteor.subscribe('income_rankings', self.incomePage.get())
		var lossesHandle = Meteor.subscribe('losses_rankings', self.lostSoldiersPage.get())

		var playerCountHandle = Meteor.subscribe('playerCount')
		var findPlayerCountHandle = Meteor.subscribe('findPlayerCount')

		self.networthLoaded.set(netHandle.ready() && playerCountHandle.ready() && findPlayerCountHandle.ready())
		self.allyLoaded.set(allyHandle.ready() && playerCountHandle.ready() && findPlayerCountHandle.ready())
		self.incomeLoaded.set(incomeHandle.ready() && playerCountHandle.ready() && findPlayerCountHandle.ready())
		self.lossesLoaded.set(lossesHandle.ready() && playerCountHandle.ready() && findPlayerCountHandle.ready())
	})

	this.autorun(function() {
		var villageHandle = Meteor.subscribe('village_rankings', self.villagesPage.get())
		var villageCountHandle = Meteor.subscribe('villageCount')
		var findVillageCountHandle = Meteor.subscribe('findVillageCount')

		self.villageLoaded.set(villageHandle.ready() && villageCountHandle.ready() && findVillageCountHandle.ready())
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
