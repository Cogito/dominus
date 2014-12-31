Meteor.methods({

	admin_setupDefaultForums: function() {
		if (get_user_property("admin")) {
			var forums = Forums.find()
			if (forums) {
				// only continus if there are no forums
				if (forums.count() == 0) {
					Meteor.call('admin_create_forum', 'News', '')
					Meteor.call('admin_create_forum', 'General', '')
					Meteor.call('admin_create_forum', 'Feature Requests', 'Issues are tracked <a href="https://github.com/dan335/dominus/issues">here</a>')
					Meteor.call('admin_create_forum', 'Report a Bug', 'Issues are tracked <a href="https://github.com/dan335/dominus/issues">here</a>')
				}
			}
		}
	},

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
