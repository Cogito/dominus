Meteor.methods({
	show_castle: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_castle: true}})
	},

	hide_castle: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_castle: false}})
	},

	show_villages: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_villages: true}})
	},

	hide_villages: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_villages: false}})
	},

	show_armies: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_armies: true}})
	},

	hide_armies: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_armies: false}})
	},

	show_lord: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_lord: true}})
	},

	hide_lord: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_lord: false}})
	},

	show_vassals: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_vassals: true}})
	},

	hide_vassals: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_vassals: false}})
	},
})