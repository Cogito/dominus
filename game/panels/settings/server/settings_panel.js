Meteor.methods({
	
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
	}

})
