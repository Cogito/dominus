Meteor.methods({
	// subscribe_to_everyone_chat: function() {
	// 	this.unblock()
	// 	var everyone = Chatrooms.findOne({name: 'Everyone'}, {fields: {_id:1}})

	// 	// if not one create it
	// 	if (!everyone) {
	// 		var id = create_chat('Everyone', false, null)
	// 	} else {
	// 		var id = everyone._id
	// 	}

	// 	subscribe_to_chatroom(Meteor.userId(), id)
	// },

	leave_chatroom_button: function(chatroom_id) {
		var room = Chatrooms.findOne(chatroom_id, {fields: {can_leave:1}})
		if (room) {
			if (room.can_leave) {
				leave_chatroom(Meteor.userId(), chatroom_id)
			}
		}
	},

	start_chat_with: function(username) {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {username:1, x:1, y:1, castle_id:1 }})
		if (user) {
			if (username == user.username) {
				// can't chat with self
				return false
			}

			var other_user = Meteor.users.findOne({username: username}, {fields: {username:1}})

			if (other_user) {
				var id = create_chat(user.username +' and '+ other_user.username, true, user._id)
				subscribe_to_chatroom(other_user._id, id)
				subscribe_to_chatroom(user._id, id)

				notification_new_chatroom_user(other_user._id, {_id: user._id, username: user.username, x: user.x, y: user.y, castle_id: user.castle_id})
				return true
			} else {
				return false
			}
		} else {
			return false
		}
	},

})


leave_chatroom = function(user_id, chatroom_id) {
	var room = Chatrooms.findOne(chatroom_id, {fields: {_id:1}})
	if (room) {
		var user = Meteor.users.findOne(user_id, {fields: {chatrooms:1}})
		if (user) {
			if (_.indexOf(user.chatrooms, chatroom_id) != -1) {
				Meteor.users.update(user_id, {$pull: {chatrooms: chatroom_id}})
				Chatrooms.update(chatroom_id, {$inc: {numMembers: -1}})
			}
		}
	}
}


subscribe_to_chatroom = function(user_id, chatroom_id) {
	var user = Meteor.users.findOne(user_id, {fields: {chatrooms:1}})
	if (user) {
		if (_.indexOf(user.chatrooms, chatroom_id) == -1) {
			Meteor.users.update(user_id, {$addToSet: {chatrooms: chatroom_id}})
			Chatrooms.update(chatroom_id, {$inc: {numMembers: 1}})
		}
	}
}


create_chat = function(name, can_leave, owner_id) {
	var id = Chatrooms.insert({
		name: name,
		can_leave: can_leave,
		numMembers: 0,
		owner_id: owner_id,
		created_at: new Date()
	})
	return id
}


destroy_chatroom = function(chatroom_id) {
	Meteor.users.update({}, {$pull: {chatrooms: chatroom_id}}, {multi:true})
	Chatrooms.remove(chatroom_id)
}


// delete chats older than 15 days if room has more than 100 chats
delete_old_chats = function() {
	// var max = 10
	// Chatrooms.find().forEach(function(room) {
	// 	if (Chats.find({room_id: room._id}).count() > max) {
	// 		var n = 0
	// 		var date = new Date()
	// 		Chats.find({room_id: room._id}, {sort: {created_at: 1}}).forEach(function(c) {
	// 			if (n == max) {
	// 				date = c.created_at
	// 			}
	// 			n++
	// 		})
	// 		console.log(date)

	// 		// var num = Chats.find({room_id: room._id}).count()
	// 		// var num_to_delete = num - 10
	// 		// Chats.remove({room_id: room._id}, {limit: num_to_delete, sort: {created_at: 1}})
	// 	}
	// })
}


setup_king_chatroom = function(king_id) {
	var king = Meteor.users.findOne(king_id, {fields: {team:1, username:1, king_chatroom:1}})
	if (king) {
		if (king.king_chatroom) {
			var king_chatroom = king.king_chatroom
		} else {
			var king_chatroom = create_chat("King "+king.username+" and Vassals", false, king_id)
			subscribe_to_chatroom(king_id, king_chatroom)
			Meteor.users.update(king_id, {$set: {king_chatroom: king_chatroom}})
			notification_new_chatroom_kings_room(king_id)
		}

		_.each(king.team, function(member) {
			var user = Meteor.users.findOne(member, {fields: {king:1, chatrooms:1}})
			if (user) {
				if (_.indexOf(user.chatrooms, king_chatroom) == -1) {
					subscribe_to_chatroom(user._id, king_chatroom)
					notification_new_chatroom_kings(user._id)
				}
			}
		})
	}
}
