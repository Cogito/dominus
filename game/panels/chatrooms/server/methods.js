Meteor.methods({
	startChatroomWith: function(username) {
		check(username, String)

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1 }})

		if (user) {
			if (username == user.username) {
				throw new Meteor.Error("Can't chat with yourself.")
			}

			var other_user = Meteor.users.findOne({username: username}, {fields: {username:1}})

			if (other_user) {
				// make sure there isn't another chatroom with only these two people
				if (Rooms.find({members: {$all: [user._id, other_user._id], $size:2}}).count() > 0) {
					throw new Meteor.Error("You already have a chatroom with "+username+".")
				}

				var id = createChatroom('Chatroom', 'normal', user._id, [user._id, other_user._id])
				notification_new_chatroom_user(other_user._id, {_id: user._id, username: user.username, x: user.x, y: user.y, castle_id: user.castle_id})
				return id
				
			} else {
				throw new Meteor.Error("Can't find a user named "+username+".")
			}
		} else {
			throw new Meteor.Error("Can't find your account.  You shouldn't see this error, please report it.")
		}
	},


	leaveChatroom: function(room_id) {
		check(room_id, String)

		var user_id = Meteor.userId()

		var room = Rooms.findOne({_id:room_id, members:user_id, type:'normal'})
		if (room) {
			// removing from members and admins removes user from chatroom
			Rooms.update(room_id, {$pull: {members:user_id, admins:user_id}})

			// if user is owner give room to person with most income
			if (room.owner == user_id) {
				if (room.members.length == 1) {
					Rooms.update(room_id, {$set: {owner:room.members[0]}})

				} else {
					// find member with highest income
					var highest = 0
					var highest_id = null
					_.each(room.members, function(member) {
						var user = Meteor.users.findOne(member, {fields: {income:1}})
						if (user && user.income > highest) {
							highest_id = user._id
							highest = user.income
						}
					})

					if (highest_id) {
						Rooms.update(room_id, {$set: {owner:highest_id}})
					} else {
						throw new Meteor.Error('Cannot find someone make owner of room.')
					}
				}
			}

		} else {
			throw new Meteor.Error("Can't find room.")
		}
	},


	renameChatroom: function(room_id, name) {
		check(room_id, String)
		check(name, String)

		var chatroomMaxNameLength = 22

		var user_id = Meteor.userId()
		var room = Rooms.findOne(room_id)

		if (room) {
			if (room.owner == user_id) {
				if (name.length < 1) {
					throw new Meteor.Error("New name is not long enough.")
				}

				if (name.length >= chatroomMaxNameLength) {
					throw new Meteor.Error("Must be less than "+chatroomMaxNameLength+" characters.")
				}

				Rooms.update(room_id, {$set: {name:name}})
				return true

			} else {
				throw new Meteor.Error("Only the owner can rename a chatroom.")
			}
		} else {
			throw new Meteor.Error("Error renaming room.")
		}
	},


	inviteToChatroom: function(room_id, name) {
		check(room_id, String)
		check(name, String)

		var user_id = Meteor.userId()
		var room = Rooms.findOne(room_id)

		if (room) {
			if (room.owner == user_id || _.contains(room.admins, user_id)) {
				var member = Meteor.users.findOne({username:name}, {fields: {username:1}})

				if (member) {
					if (_.contains(room.members, member._id)) {
						throw new Meteor.Error(name+" is already in this chatroom.")
					}

					Rooms.update(room_id, {$addToSet: {members:member._id}})

				} else {
					throw new Meteor.Error("Can't find anyone named "+name+".")
				}

			} else {
				throw new Meteor.Error('Only the room owner and admins can invite users.')
			}

		} else {
			throw new Meteor.Error('Error inviting user.')
		}
	},


	// must be owner
	// owner is now admin
	chatroomMakeOwner: function(room_id, member_id) {
		check(room_id, String)
		check(member_id, String)

		var user_id = Meteor.userId()

		// make sure member exists
		if (Meteor.users.find(member_id).count() != 1) {
			return false
		}

		var room = Rooms.findOne({_id:room_id, owner:user_id})
		if (room) {
			// make sure member_id is a member of room
			if (!_.contains(room.members, member_id)) {
				return false
			}

			Rooms.update(room_id, {
				$set: {owner:member_id},
				$addToSet: {admins:user_id}
			})

			Rooms.update(room_id, {
				$pull: {admins:member_id}
			})
		}
	},


	// if I am owner or admin and other user is not admin or owner
	chatroomMakeAdmin: function(room_id, member_id) {
		check(room_id, String)
		check(member_id, String)

		var user_id = Meteor.userId()

		// make sure member exists
		if (Meteor.users.find(member_id).count() != 1) {
			return false
		}

		var room = Rooms.findOne(room_id)
		if (room) {
			// make sure member_id is a member of room
			if (!_.contains(room.members, member_id)) {
				return false
			}

			if (room.owner == user_id || _.contains(room.admins, user_id)) {
				if (room.owner != member_id) {
					if (!_.contains(room.admins, member_id)) {
						Rooms.update(room_id, {$addToSet: {admins:member_id}})						
					}
				}
			}
		}
	},


	// if i am owner and user is admin
	chatroomRemoveAdmin: function(room_id, member_id) {
		check(room_id, String)
		check(member_id, String)

		var user_id = Meteor.userId()

		// make sure member exists
		if (Meteor.users.find(member_id).count() != 1) {
			return false
		}

		var room = Rooms.findOne(room_id)
		if (room) {
			// make sure member_id is a member of room
			if (!_.contains(room.members, member_id)) {
				return false
			}

			// i am owner
			if (room.owner != user_id) {
				return false
			}

			if (!_.contains(room.admins, member_id)) {
				return false
			}

			Rooms.update(room_id, {$pull: {admins:member_id}})
		}
	},


	// if i am owner - can kick anyone
	// if i am admin - can kick not admin
	kickFromChatroom: function(room_id, member_id) {
		check(room_id, String)
		check(member_id, String)

		var user_id = Meteor.userId()

		// make sure member exists
		if (Meteor.users.find(member_id).count() != 1) {
			return false
		}

		var room = Rooms.findOne(room_id)
		if (room) {
			// make sure member_id is a member of room
			if (!_.contains(room.members, member_id)) {
				return false
			}

			// i am owner
			if (room.owner == user_id) {
				Rooms.update(room_id, {$pull: {admins:member_id, members:member_id}})
			}

			// i am admin
			if (_.contains(room.admins, user_id)) {
				// member is not owner
				if (room.owner != member_id) {
					// member is not an admin
					if (!_.contains(room.admins, member_id)) {
						Rooms.update(room_id, {$pull: {members:member_id}})
					}
				}
			}
		}
	},
})