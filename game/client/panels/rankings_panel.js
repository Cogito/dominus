Template.rankings_panel.helpers({
	top10_networth: function() {
		var users = Meteor.users.find({}, {sort: {networth: -1}, limit: 15}).map(function(u) {
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
		var users = Meteor.users.find({}, {sort: {income: -1}, limit: 15}).map(function(u) {
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
		var users = Meteor.users.find({}, {sort: {num_allies_below: -1}, limit: 15}).map(function(u) {
			if (u._id == Meteor.userId()) {
				u.is_me = true
			} else {
				u.is_me = false
			}
			return u
		})

		return users
	},

	top10_vassals: function() {
		var users = Meteor.users.find({}, {sort: {num_vassals: -1}, limit: 15}).map(function(u) {
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
		var users = Meteor.users.find({}, {sort: {losses_worth: -1}, limit: 15}).map(function(u) {
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
		var d = Meteor.users.find({is_dominus: true})
		return d
	}
})



Template.rankings_panel.destroyed = function() {
	if (this.deps_subscribe) {
		this.deps_subscribe.stop()
	}
}


Template.rankings_panel.rendered = function() {
	// subscribe
	this.deps_subscribe = Deps.autorun(function() {
		Meteor.subscribe('networth_rankings')
		Meteor.subscribe('ally_rankings')
		Meteor.subscribe('vassal_rankings')
		Meteor.subscribe('income_rankings')
		Meteor.subscribe('losses_rankings')
		Meteor.subscribe('dominus')
	})

	logevent('panel', 'open', 'rankings')
}