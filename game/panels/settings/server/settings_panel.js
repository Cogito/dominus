Meteor.methods({
	
	// deleteAccount: function() {
	// 	var user = Meteor.users.findOne(Meteor.userId())
	// 	if (user) {
	// 		var appendToName = ' (deleted)'

	// 		Chats.update({user_id: user._id}, {$set: {username: user.username+appendToName}}, {multi: true})
			
	// 		for (var i = 0; i < user.chatrooms.length; i++) {
	// 			leave_chatroom(user._id, user.chatrooms[i])
	// 		}

	// 		Castles.remove({user_id: user._id})
	// 		Villages.remove({user_id: user._id})
	// 		Armies.remove({user_id: user._id})
	// 		Moves.remove({user_id: user._id})
	// 		Threads.update({user_id: user._id}, {$set: {username: user.username+appendToName}}, {multi: true})
	// 		Threads.update({last_post_username: user.username}, {$set: {last_post_username: user.username+appendToName}}, {multi: true})
	// 		Messages.update({user_id: user._id}, {$set: {username: user.username+appendToName}}, {multi: true})
	// 		Charges.update({user_id: user._id}, {$set: {user_username: user.username+appendToName}}, {multi: true})

	// 		Hexes.update({x:user.x, y:user.y}, {$set: {has_building:false, nearby_buildings:false}})

	// 		Meteor.users.remove({_id:user._id})
	// 	}
	// },


	change_username: function(username) {
		username = _.clean(username)
		username = username.replace(/\W/g, '')
		
		if (username.length < 3) {
			return {result: false, msg: 'New username must be at least 3 characters long.'}
		}

		if (username.length > 30) {
			return {result: false, msg: 'New username is too long.'}
		}

		if (Meteor.users.find({username: username}).count() > 0) {
			return {result: false, msg: 'A user exists with this username, try another.'}
		}

		// if (username == 'danimal' || username == 'danlmal' || username == 'Danlmal' || username.indexOf('danimal') > -1 || username.indexOf('Danimal') > -1) {
		// 	return {result: false, msg: 'Username not allowed.'}
		// }

		
		Chats.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Castles.update({user_id: Meteor.userId()}, {$set: {username: username}})
		Villages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Armies.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Threads.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Threads.update({last_post_username: get_user_property("username")}, {$set: {last_post_username: username}}, {multi: true})
		Messages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
		Charges.update({user_id: Meteor.userId()}, {$set: {user_username: username}}, {multi: true})
		Meteor.users.update(Meteor.userId(), {$set: {username: username}})

		return {result: true}
	},

	show_coords: function () {
		Meteor.users.update(Meteor.userId(), {$set: {sp_show_coords: true}})
	},

	hide_coords: function() {
		Meteor.users.update(Meteor.userId(), {$set: {sp_show_coords: false}})
	},

	show_minimap: function () {
		Meteor.users.update(Meteor.userId(), {$set: {sp_show_minimap: true}})
	},

	hide_minimap: function() {
		Meteor.users.update(Meteor.userId(), {$set: {sp_show_minimap: false}})
	},
})
