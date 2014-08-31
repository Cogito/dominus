Template.lp_lord.helpers({
	lord: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {lord: 1}})
		if (res) {
			var lord = Meteor.users.findOne(res.lord, {fields: {username: 1, x: 1, y: 1, castle_id: 1}})
			if (lord) {
				return lord
			}
		}
		return false
	},
})

// Template.lp_lord.destroyed = function() {
// 	this.deps_subscribe.stop()
// }


// Template.lp_lord.rendered = function() {
// 	this.deps_subscribe = Deps.autorun(function() {
// 		var user = Meteor.users.findOne(Meteor.userId(), {fields: {lord':1}})
// 		if (user) {
// 			Meteor.subscribe('my_lord', user.lord)
// 		}
// 	})
// }