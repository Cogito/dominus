var admin_publish = function (name, handler) {
	Meteor.publish(name, function() {
		if(this.userId && get_user_property("admin", this.userId)) {
			return handler()
		} else {
			this.ready()
		}
	})
}

admin_publish('admin_forums', function() {
	return Forums.find()
})

admin_publish('admin_charges', function() {
	return Charges.find()
})

admin_publish('admin_gamestats', function() {
	return Gamestats.find()
})

admin_publish('admin_jobstats', function() {
	return Jobstats.find()
})

Meteor.publish('admin_jobqueue', function() {
	return Jobqueue.find()
})

admin_publish('admin_mailchimp_list', function() {
	return Meteor.users.find({}, {fields: {username:1, emails:1}})
})

Meteor.publish('admin_users_online', function() {
	return Meteor.users.find({"status.online":true}, {fields: {username:1, "status.lastLogin.date":1, "status.online":1}})
})


admin_publish('admin_chatrooms', function() {
	return Rooms.find()
})