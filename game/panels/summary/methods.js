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

	show_lords: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_lords: true}})
	},

	hide_lords: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_lords: false}})
	},

	show_allies: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_allies: true}})
	},

	hide_allies: function() {
		Meteor.users.update(Meteor.userId(), {$set: {lp_show_allies: false}})
	},
})