Meteor.methods({

	admin_run_update_allies_username: function(username) {
		if (get_user_property("admin")) {
			check(username, String)

			var user = Meteor.users.findOne({username:username}, {fields: {_id:1}})
			if (user) {
				Cue.addTask('update_allies', {isAsync:true, unique:true}, {user_id:user._id})
			}
		}
	},

	admin_cleanupAllKingChatrooms: function() {
		if (get_user_property("admin")) {
			Cue.addTask('cleanupAllKingChatrooms', {isAsync:true, unique:true}, {})
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
			Cue.addTask('enemy_on_building_check', {isAsync:false, unique:true}, {})
		}
	},

	admin_enemiesTogetherCheck: function() {
		if (get_user_property("admin")) {
			Cue.addTask('enemies_together_check', {isAsync:false, unique:true}, {})
		}
	},


})
