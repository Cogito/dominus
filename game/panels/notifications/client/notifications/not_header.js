Template.not_header.helpers({
	date_nice: function() {
		Session.get('refresh_time_field')
		return moment(new Date(this.created_at)).calendar()
	},

	show_mine: function() {
		return (Session.get('notifications_type') == 'notifications_mine')
	},
})