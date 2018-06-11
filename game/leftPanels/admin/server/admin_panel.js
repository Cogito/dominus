Meteor.methods({

	give_gold: function(num_gold) {
		if (process.env.NODE_ENV == 'development') {
			if (get_user_property("admin")) {
				Meteor.users.update({_id: Meteor.userId()}, {$inc: {
					gold: num_gold
				}})
			}
		}
	},

	delete_user: function(user_id) {
		if (process.env.NODE_ENV == 'development') {
			if (get_user_property("admin")) {
				deleteAccount(user_id)
			}
		}
	},

	delete_all_users: function() {
		if (process.env.NODE_ENV == 'development') {
			if (get_user_property("admin")) {
				Meteor.users.find().forEach(function(user) {
					deleteAccount(user._id)
				})
			}
		}
	},

	reset_everyone_resources: function() {
		if (process.env.NODE_ENV == 'development') {
			if (get_user_property("admin")) {
				Meteor.users.find().forEach(function(u) {
					Meteor.users.update(u._id, {$set: {
						gold: s.starting_resources.gold,
						grain: s.starting_resources.grain,
						lumber: s.starting_resources.lumber,
						ore: s.starting_resources.ore,
						wool: s.starting_resources.wool,
						clay: s.starting_resources.clay,
						glass: s.starting_resources.glass,
					}})
				})
			}
		}
	},

	server_call: function (method_name) {
		if (process.env.NODE_ENV == 'development') {
			if (get_user_property("admin")) {
				var args = Array.prototype.slice.call(arguments, 1)
				var result = global[method_name].apply(this, args)
				console.log("clientside_server_call: " + method_name + ", args: ")
				console.log(args)
				return result
			}
		}
	}
})
