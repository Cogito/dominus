Template.adminUsersOnline.helpers({
	users: function() {
		return Meteor.users.find({"status.online":true}, {fields: {username:1, "status.lastLogin.date":1, "status.online":1}})
	},
})