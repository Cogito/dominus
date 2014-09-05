Meteor.methods({
	forum_new_thread: function(title, message, forum_id) {
		if (title.length < 1) {
			return false
		}

		if (message.length < 1) {
			return false
		}

		if (title.length > 100) {
			return false
		}

		if (message.length > 5000) {
			return false
		}

		message = message.replace(/\r?\n/g, '<br />');

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1}})

		var id = Threads.insert({
			name: title,
			forum_id: forum_id,
			user_id: user._id,
			username: user.username,
			last_post_username: user.username,
			created_at: new Date(),
			updated_at: new Date(),
			numMessages: 1,
			numViews: 0
		})

		Messages.insert({
			forum_id: forum_id,
			thread_id: id,
			user_id: user._id,
			username: user.username,
			created_at: new Date(),
			updated_at: new Date(),
			message: message,
			castle_x: user.x,
			castle_y: user.y,
			castle_id: user.castle_id
		})

		Forums.update(forum_id, {$inc: {
			numThreads: 1,
			numMessages: 1
		}})

		Forums.update(forum_id, {$set: {
			updated_at: new Date()
		}})

		Latestmessages.upsert({forum_id: forum_id}, {updated_at:new Date(), forum_id:forum_id, user_id: Meteor.userId()})
	},

	forum_new_message: function(message, forum_id, thread_id) {
		if (message.length < 1) {
			return false
		}

		if (message.length > 5000) {
			return false
		}

		message = message.replace(/\r?\n/g, '<br />');

		// this won't work anymore?
		// var sanitizeHtml = Meteor.require('sanitize-html')
		// var clean_message = sanitizeHtml(message, {
		// 	allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img' ]),
		// })

		// trying this instead of above
		clean_message = message.replace(/<(?!br\s*\/?)[^>]+>/g, '')

		Messages.insert({
			forum_id: forum_id,
			thread_id: thread_id,
			user_id: Meteor.userId(),
			username: get_user_property("username"),
			created_at: new Date(),
			updated_at: new Date(),
			message: clean_message,
			castle_x: get_user_property("x"),
			castle_y: get_user_property("y"),
			castle_id: get_user_property("castle_id")
		})

		Threads.update(thread_id, {$inc: {
			numMessages: 1
		}})

		Threads.update(thread_id, {$set: {
			updated_at: new Date(),
			last_post_username: get_user_property("username"),
		}})

		Forums.update(forum_id, {$inc: {
			numMessages: 1
		}})

		Forums.update(forum_id, {$set: {
			updated_at: new Date()
		}})

		Latestmessages.upsert({forum_id: forum_id}, {updated_at:new Date(), forum_id:forum_id, user_id: Meteor.userId()})
	},

	forum_add_view: function(thread_id) {
		Threads.update(thread_id, {$inc: {
			numViews: 1
		}})
	}
})