Meteor.methods({

	admin_run_update_allies_username: function(username) {
		if (Meteor.user().admin) {
			check(username, String)

			var user = Meteor.users.findOne({username:username}, {fields: {_id:1}})
			if (user) {
				worker.enqueue('update_allies', {user_id: user._id})
			}
		}
	},


})