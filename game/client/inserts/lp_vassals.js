Template.lp_vassals.helpers({
	vassals: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {vassals: 1}})
		if (user) {
			if (user.vassals) {
				check(user.vassals, Array)
				if (user.vassals.length > 0) {
					var res = Meteor.users.find({_id: {$in: user.vassals}}, {sort: {username: 1}, fields: {username: 1, x: 1, y: 1, castle_id: 1}})
					if (res.count() > 0) {
						return res
					}
				}
			}
		}
		return false
	}
})

// Template.lp_vassals.destroyed = function() {
// 	this.deps_subscribe.stop()
// }


// Template.lp_vassals.rendered = function() {
// 	this.deps_subscribe = Deps.autorun(function() {
// 		var user = Meteor.users.findOne(Meteor.userId(), {fields: {vassals:1}})
// 		if (user) {
// 			Meteor.subscribe('my_vassals', user.vassals)
// 		}
// 	})
// }