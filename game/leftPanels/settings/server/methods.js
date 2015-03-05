Meteor.methods({

	deleteAccount: function(username) {
		this.unblock()
		var caller = Meteor.users.findOne(Meteor.userId())
		if (caller) {
			if (caller.admin) {
				if (!username) {
					var user = caller
				} else {
					var user = Meteor.users.findOne({username:username})
				}
			} else {
				if (username) {
					throw new Meteor.Error('Not admin.')
				}
				var user = caller
			}

			if (user) {
				Cue.addTask('deleteAccount', {isAsync:false, unique:true}, {user_id:user._id})
				gAlert_accountDeleted(user.username)
			}
		}
	},


	change_username: function(username) {
		check(username, String)

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {is_king:1, username:1}})
		if (user) {
			var previousUsername = user.username

			username = _.clean(username)
			username = username.replace(/\W/g, '')

			if (username.length < 3) {
				throw new Meteor.Error('New username must be at least 3 characters long.')
			}

			if (username.length > 30) {
				throw new Meteor.Error('New username is too long.')
			}

			if (Meteor.users.find({username: username}).count() > 0) {
				throw new Meteor.Error('A user exists with this username, try another.')
			}

			// if (username == 'danimal' || username == 'danlmal' || username == 'Danlmal' || username.indexOf('danimal') > -1 || username.indexOf('Danimal') > -1) {
			// 	return {result: false, msg: 'Username not allowed.'}
			// }

			// name of king's chatroom
			if (user.is_king) {
				var room = Rooms.findOne({type:'king', owner:user._id})
				if (room) {
					Rooms.update(room._id, {$set: {name:'King '+username+' and Vassals'}})
				}
			}

			Castles.update({user_id: Meteor.userId()}, {$set: {username: username}})
			Villages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
			Armies.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
			Threads.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
			Threads.update({last_post_username: get_user_property("username")}, {$set: {last_post_username: username}}, {multi: true})
			Messages.update({user_id: Meteor.userId()}, {$set: {username: username}}, {multi: true})
			Charges.update({user_id: Meteor.userId()}, {$set: {user_username: username}}, {multi: true})
			Meteor.users.update(Meteor.userId(), {$set: {username: username}})

			gAlert_nameChange(Meteor.userId(), previousUsername, username)

			return true
		} else {
			throw new Meteor.Error("Can't find user.  This shouldn't happen, please report it.")
		}
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
	}
})



Cue.addJob('deleteAccount', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	deleteAccount(task.data.user_id)
	done()
})


deleteAccount = function(user_id) {
	var user = Meteor.users.findOne(user_id)

	if (!user) {
		return false
	}



	var appendToName = '(deleted)'

	Villages.find({user_id: user._id}).forEach(function(village) {
		destroyVillage(village._id)
	})

	Armies.remove({user_id: user._id})
	Moves.remove({user_id: user._id})
	Threads.update({user_id: user._id}, {$set: {username: user.username+appendToName}}, {multi: true})
	Threads.update({last_post_username: user.username}, {$set: {last_post_username: user.username+appendToName}}, {multi: true})
	Messages.update({user_id: user._id}, {$set: {username: user.username+appendToName}}, {multi: true})
	Charges.update({user_id: user._id}, {$set: {user_username: user.username+appendToName}}, {multi: true})


	// fix chat
	Roomchats.remove({user_id:user._id})
	Rooms.find({members:user._id}).forEach(function(room) {
		// remove from admins and members
		Rooms.update(room._id, {$pull: {admins:user._id, members:user._id}})

		// is user owner?
		// give owner to someone else
		if (room.owner == user._id) {
			removeOwnerFromRoom(room._id)
		}
	})


	// fix tree
	if (user.lord) {
		var lord = Meteor.users.findOne(user.lord)
		if (lord) {
			// give vassals to lord
			_.each(user.vassals, function(vassal_id) {
				var vassal = Meteor.users.findOne(vassal_id)
				if (vassal) {
					set_lord_and_vassal(lord._id, vassal._id)
				}
			})

			// remove from lord
			remove_lord_and_vassal(lord._id, user._id)

			// update lord's tree
			// var rf = new relation_finder(lord._id)
			// rf.start()
		}
	} else {
		// make vassals kings
		_.each(user.vassals, function(vassal_id) {
			var vassal = Meteor.users.findOne(vassal_id)
			if (vassal) {
				remove_lord_and_vassal(user._id, vassal._id)
				// var rf = new relation_finder(vassal._id)
				// rf.start()
			}
		})
	}

	// remove from everyone's allies
	// Meteor.users.find().forEach(function(u) {
	// 	if (_.indexOf(u.allies))
	// })


	Castles.remove({user_id: user._id})
	Hexes.update({x:user.x, y:user.y}, {$set: {has_building:false, nearby_buildings:false}})

	Meteor.users.remove({_id:user._id})

	Cue.addTask('setupEveryoneChatroom', {isAsync:false, unique:true}, {})
	Cue.addTask('check_for_dominus', {isAsync:false, unique:true}, {})
}
