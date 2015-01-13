Template.not_no_longer_dominus_new_user.helpers({
	mine: function() {
		return Session.get('notifications_type') == 'notifications_mine'
	}
})