Template.rankings_panel.helpers({
	top10_networth: function() {
		return RankingsNetworth.find({}, {sort: {networth: -1}}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})
	},

	top10_income: function() {
		return RankingsIncome.find({}, {sort: {income: -1}}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})
	},

	top10_allies: function() {
		return RankingsAllies.find({}, {sort: {num_allies_below: -1}}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})
	},

	top10_losses: function() {
		return RankingsLostSoldiers.find({}, {sort: {losses_worth: -1}}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})
	},

	dominus: function() {
		return RankingsDominus.findOne()
	},

	top10_villages: function() {
		return RankingsVillages.find({}, {sort: {"income.worth": -1}}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})
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
	}
})


Template.rankings_panel.created = function() {
	this.autorun(function() {
		Meteor.subscribe('networth_rankings')
		Meteor.subscribe('ally_rankings')
		Meteor.subscribe('income_rankings')
		Meteor.subscribe('losses_rankings')
		Meteor.subscribe('dominus_rankings')
		Meteor.subscribe('village_rankings')
	})
}


Template.rankings_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}