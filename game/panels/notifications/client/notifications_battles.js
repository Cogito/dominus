Template.notifications_battles.helpers({
	battles: function() {
		return Battles.find()
	},

	date_nice: function() {
		Session.get('refresh_time_field')
		return moment(new Date(this.created_at)).calendar()
	},

	title: function() {
		return 'Battle at '+this.x+', '+this.y
	},

	show_notification: function() {
		if (Session.get('current_notification_id') == this._id) {
			return true
		}
		return false
	},
})


Template.notifications_battles.events({
	'click .read_notification_button': function(event, template) {
		if (Session.get('current_notification_id') == this._id) {
			Session.set('current_notification_id', undefined)
		} else {
			Session.set('current_notification_id', this._id)
		}
	},
})


Template.notifications_battles.rendered = function() {
	this.autorun(function() {
		Meteor.subscribe('battle_notifications')
	})
}