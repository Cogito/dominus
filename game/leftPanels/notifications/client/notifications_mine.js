Template.notifications_mine.helpers({
	notification_titles_mine: function() {
		return NotificationsTitlesMine.find({}, {sort: {created_at: -1}})
	},

	notification_data: function() {
		return Notifications.findOne()
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

	icon_name: function() {
		return get_notification_icon(this.type)
	}
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


Template.notifications_mine.created = function() {
	Session.set('current_notification_id', undefined)

	this.autorun(function() {
		Meteor.subscribe('notifications_titles_mine')

		if (Session.get('current_notification_id')) {
			Meteor.subscribe('a_notification', Session.get('current_notification_id'))
		}
	})
}