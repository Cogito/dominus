Template.not_now_dominus.helpers({
	mine: function() {
		return Session.get('notifications_type') == 'notifications_mine'
	}
})