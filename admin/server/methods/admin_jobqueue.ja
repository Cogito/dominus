Meteor.methods({

	admin_empty_jobqueue: function() {
		if (get_user_property("admin")) {
			if (worker) {
				worker.empty_queue()
			}
		}
	},


})