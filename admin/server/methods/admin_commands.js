Meteor.methods({

	admin_run_update_allies_username: function(username) {
		if (get_user_property("admin")) {
			check(username, String)

			var user = Meteor.users.findOne({username:username}, {fields: {_id:1}})
			if (user) {
				worker.enqueue('update_allies', {user_id: user._id})
			}
		}
	},

	admin_cleanupAllKingChatrooms: function() {
		if (get_user_property("admin")) {
			cleanupAllKingChatrooms()
		}
	},

	admin_bakeMap: function() {
		if (get_user_property("admin")) {
			var mapbaker = new Mapbaker()
			mapbaker.bakeHexes()
		}
	},

	admin_enemyOnBuildingCheck: function() {
		if (get_user_property("admin")) {
			enemy_on_building_check()
		}
	},

	admin_enemiesTogetherCheck: function() {
		if (get_user_property("admin")) {
			enemies_together_check()
		}
	},


})
