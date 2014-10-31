Template.adminMailchimpList.helpers({
	users: function() {
		return Meteor.users.find()
	}
})