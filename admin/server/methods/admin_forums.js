Meteor.methods({

	admin_create_forum: function(name, desc) {
		if (get_user_property("admin")) {
			desc = desc.replace(/\r?\n/g, '<br />')

			if (desc.length < 1) {
				desc = null
			}

			if (name.length > 1) {
				Forums.insert({
					name: name,
					description: desc,
					order: Forums.find().count(),
					numThreads: 0,
					numMessages: 0,
					created_at: new Date(),
					updated_at: new Date()
				})
			}
		}
	},

	admin_delete_forum: function(id) {
		if (get_user_property("admin")) {
			console.log(id)
			Forums.remove(id)
			Latestmessages.remove({forum_id:id})
		}
	},

	admin_forum_move_up: function(id) {
		if (get_user_property("admin")) {
			var forum = Forums.findOne(id)
			Forums.update({order: forum.order-1}, {$set: {order: forum.order}})
			Forums.update(id, {$set: {order: forum.order-1}})
		}
	},

	admin_forum_move_down: function(id) {
		if (get_user_property("admin")) {
			var forum = Forums.findOne(id)
			Forums.update({order: forum.order+1}, {$set: {order: forum.order}})
			Forums.update(id, {$set: {order: forum.order+1}})
		}
	}

})
