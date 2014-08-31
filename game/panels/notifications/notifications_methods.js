Meteor.methods({
	mark_notification_read: function(id) {
		this.unblock()
		var n = Notifications.findOne(id, {fields: {user_id:1}})
		if (n && n.user_id == Meteor.userId()) {
			Notifications.update(id, {$set: {
				read: true
			}})
		}
	},

	mark_all_notifications_read: function() {
		this.unblock()

		Notifications.update({user_id: Meteor.userId()}, {$set: {read:true}}, {multi:true})
	}
})