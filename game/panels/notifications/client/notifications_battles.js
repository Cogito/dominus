Template.notifications_battles.helpers({
	battles: function() {
		return Battles.find()
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

	icon_name: function() {
		return get_notification_icon('battle')
	}
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


Template.notifications_battles.created = function() {
	this.autorun(function() {
		Meteor.subscribe('battle_notifications')
	})
}