Template.notifications_global.helpers({
	notification_titles_global: function() {
		var self = this
		var not = NotificationsTitlesGlobal.find({}, {sort: {created_at: -1}})
		// battle notifications are doubled because one is created for both attacker and defender
		// only show people who win
		not = _.filter(not.fetch(), function(n) {
			if (n.type == 'battle' && n.title) {
				if (n.title.indexOf('won') != -1) {
					return true
				} else {
					return false
				}
			} else if (n.type == 'new_dominus') {
				if (n.user_id == Meteor.userId()) {
					return true
				} else {
					return false
				}
			} else {
				return true
			}
		})
		return not
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

Template.notifications_global.events({
	'click .read_notification_button': function(event, template) {
		if (Session.get('current_notification_id') == this._id) {
			Session.set('current_notification_id', undefined)
		} else {
			Session.set('current_notification_id', this._id)
		}
	},
})

Template.notifications_global.created = function() {
	var self = this
	Session.set('current_notification_id', undefined)

	this.autorun(function() {
		Meteor.subscribe('notifications_titles_global')

		if (Session.get('current_notification_id')) {
			Meteor.subscribe('a_notification', Session.get('current_notification_id'))
		}
	})
}