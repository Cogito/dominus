Template.rankings_panel.helpers({
	top10_networth: function() {
		var users = RankingsNetworth.find({}, {sort: {networth: -1}, limit: 15}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})

		return users
	},

	top10_income: function() {
		var users = RankingsIncome.find({}, {sort: {income: -1}, limit: 15}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})

		return users
	},

	top10_allies: function() {
		var users = RankingsAllies.find({}, {sort: {num_allies_below: -1}, limit: 15}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})

		return users
	},

	top10_losses: function() {
		var users = RankingsLostSoldiers.find({}, {sort: {losses_worth: -1}, limit: 15}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})

		return users
	},

	dominus: function() {
		return RankingsDominus.findOne()
	}
})



Template.rankings_panel.created = function() {
	this.autorun(function() {
		Meteor.subscribe('networth_rankings')
		Meteor.subscribe('ally_rankings')
		Meteor.subscribe('income_rankings')
		Meteor.subscribe('losses_rankings')
		Meteor.subscribe('dominus_rankings')
	})
}