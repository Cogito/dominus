Template.notifications_mine.helpers({
	notifications: function() {
		return Notifications.find({}, {sort: {created_at: -1}})
	},

	notification_type: function() {
		return 'not_'+this.type
	},

	show_notification: function() {
		if (Session.get('current_notification_id') == this._id) {
			return true
		}
		return false
	},
})


Template.notifications_mine.events({
	'click .read_notification_button': function(event, template) {
		Meteor.call('mark_notification_read', this._id)
		if (Session.get('current_notification_id') == this._id) {
			Session.set('current_notification_id', undefined)
		} else {
			Session.set('current_notification_id', this._id)
		}
	},

	'click #clear_all_notifications_button': function(event, template) {
		Meteor.call('mark_all_notifications_read')
	},
})


Template.notifications_mine.rendered = function() {
	Session.set('current_notification_id', undefined)
	this.deps_subscribe_mine = Deps.autorun(function() {
		Meteor.subscribe('my_notifications')
	})
}



Template.notifications_mine.destroyed = function() {
	if (this.deps_subscribe_mine) {
		this.deps_subscribe_mine.stop()
	}
}