Template.admin_mailchimp_list.helpers({
	users: function() {
		return Meteor.users.find()
	}
})