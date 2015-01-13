Meteor.methods({

	give_gold: function(num_gold) {
		if (get_user_property("admin")) {
			Meteor.users.update({_id: Meteor.userId()}, {$inc: {
				gold: num_gold
			}})
		}
	},

	delete_user: function(user_id) {
		if (get_user_property("admin")) {
			Castles.remove({user_id: user_id})
			Villages.remove({user_id: user_id})
			Armies.remove({user_id: user_id})
			Dailystats.remove({user_id: user_id})
			Meteor.users.remove({_id: user_id})
			Moves.remove({user_id:user_id})
		}
	},

	delete_all_users: function() {
		if (Meteor.user() && get_user_property("admin")) {
			Castles.remove({})
			Villages.remove({})
			Armies.remove({})
			Dailystats.remove({})
			Meteor.users.remove({})
			Rooms.remove({})
			Roomchats.remove({})
			Recentchats.remove({})
			Messages.remove({})
			Threads.remove({})
			Jobqueue.remove({})
			Moves.remove({})
			Forums.update({}, {$set: {
				numThreads: 0,
				numMessages: 0
			}}, {multi: true})
		}
	},

	reset_everyone_resources: function() {
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
	},

	server_call: function (method_name) {
		if (get_user_property("admin")) {
			var args = Array.prototype.slice.call(arguments, 1)
			var result = global[method_name].apply(this, args)
			console.log("clientside_server_call: " + method_name + ", args: ")
			console.log(args)
			return result
		}
	}
})
