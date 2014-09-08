Template.not_no_longer_dominus.helpers({
	mine: function() {
		return Session.get('notifications_type') == 'notifications_mine'
	}
})