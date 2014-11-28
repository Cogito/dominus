Template.chatroom_member.helpers({
	// if I am owner and other user is admin show make owner button
	showMakeOwnerButton: function() {
		var user_id = Meteor.userId()
		var member_id = Template.currentData()._id
		var owner_id = Template.parentData(1).owner
		var admins = Template.parentData(1).admins

		if (user_id == member_id) {
			return false
		}

		if (user_id == owner_id) {
			if (_.contains(admins, member_id)) {
				return true
			}
		}

		return false
	},

	// if I am owner or admin and other user is not admin show make owner button
	showMakeAdminButton: function() {
		var user_id = Meteor.userId()
		var member_id = Template.currentData()._id
		var owner_id = Template.parentData(1).owner
		var admins = Template.parentData(1).admins

		if (user_id == member_id) {
			return false
		}

		// if I am owner or admin
		if (user_id == owner_id || _.contains(admins, user_id)) {
			// if other user is not owner or admin
			if (member_id != owner_id) {
				if (!_.contains(admins, member_id)) {
					return true
				}
			}
		}

		return false
	},


	// if i cam owner and user is admin
	showRemoveAdminButton: function() {
		var user_id = Meteor.userId()
		var member_id = Template.currentData()._id
		var owner_id = Template.parentData(1).owner
		var admins = Template.parentData(1).admins

		if (user_id == member_id) {
			return false
		}

		if (user_id == owner_id) {
			if (_.contains(admins, member_id)) {
				return true
			}
		}

		return false
	},


	// if i am owner - can kick anyone
	// if i am admin - can kick not admin
	showKickButton: function() {
		var user_id = Meteor.userId()
		var member_id = Template.currentData()._id
		var owner_id = Template.parentData(1).owner
		var admins = Template.parentData(1).admins

		if (user_id == member_id) {
			return false
		}

		// if i am owner
		if (user_id == owner_id) {
			return true
		}

		// if i am admin
		if (_.contains(admins, user_id)) {
			if (!_.contains(admins, member_id)) {
				if (owner_id != member_id) {
					return true
				}
			}
		}

		return false
	}
})



Template.chatroom_member.events({
	'click .makeOwnerButton': function(event, template) {
		Meteor.call('chatroomMakeOwner', Template.parentData(1)._id, Template.currentData()._id)
	},


	'click .makeAdminButton': function(event, template) {
		Meteor.call('chatroomMakeAdmin', Template.parentData(1)._id, Template.currentData()._id)
	},


	'click .removeAdminButton': function(event, template) {
		Meteor.call('chatroomRemoveAdmin', Template.parentData(1)._id, Template.currentData()._id)
	},


	'click .kickButton': function(event, template) {
		Meteor.call('kickFromChatroom', Template.parentData(1)._id, Template.currentData()._id)
	},
})