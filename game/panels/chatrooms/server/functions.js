// type is "normal" or "everyone" or "king"
// members is an array of user_ids
createChatroom = function(name, type, owner, members) {
	var id = Rooms.insert({
		name: name,
		type: type,
		members: members,
		admins: [],
		owner: owner,
		created_at: new Date()
	})
	return id
}


// call this function when the owner deletes their account or leaves chatroom
// give owner to someone else or delete room if there are no members
removeOwnerFromRoom = function(room_id) {
	check(room_id, String)

	var room = Rooms.findOne(room_id)
	if (room) {
		var owner = room.owner
		if (owner) {
			Rooms.update(room_id, {$pull: {members:owner, admins:owner}})

			// get room again because we pulled from admins and members
			var room2 = Rooms.findOne(room._id)
			if (room2) {
				// are there admins?
				if (room2.admins.length > 0) {

					// find admin with highest income
					var highest = -1
					var highest_id = null
					_.each(room2.admins, function(member) {
						var user = Meteor.users.findOne(member, {fields: {income:1}})
						if (user && user.income > highest) {
							highest_id = user._id
							highest = user.income
						}
					})

					if (highest_id) {
						Rooms.update(room2._id, {
							$set:{owner:highest_id},
							$pull:{admins:highest_id}
						})
					} else {
						throw new Meteor.Error('Cannot find someone make owner of room.')
					}

				} else {
					// no admins
					// are there members?
					if (room2.members.length > 0) {

						// find member with highest income
						var highest = -1
						var highest_id = null
						_.each(room2.members, function(member) {
							var user = Meteor.users.findOne(member, {fields: {income:1}})
							if (user && user.income > highest) {
								highest_id = user._id
								highest = user.income
							}
						})

						if (highest_id) {
							Rooms.update(room2._id, {
								$set:{owner:highest_id}
							})
						} else {
							throw new Meteor.Error('Cannot find someone make owner of room.')
						}

					} else {
						// owner is the only member
						// delete room
						Rooms.remove(room2._id)
					}
				}
			}
		}
	}
}




// create or update members in king's chatroom
setupKingChatroom = function(king_id) {
	check(king_id, String)

	var king = Meteor.users.findOne(king_id, {fields: {is_king:1, team:1, username:1}})
	if (king && king.is_king) {

		if (king.team) {
			var members = king.team
		} else {
			var members = []
		}
		members.push(king._id)
		
		// does king already have a chatroom
		var room = Rooms.findOne({owner:king._id, type:'king'})
		if (room) {
			// king already has a room
			Rooms.update(room._id, {$set: {members:members}})
		} else {
			// create a room for king
			createChatroom('King '+king.username+' and Vassals', 'king', king._id, members) 
		}
	}
}




// run when someone is no longer a king
destroyKingChatroom = function(king_id) {
	check(king_id, String)

	var user = Meteor.users.findOne(king_id, {fields: {is_king:1, team:1, username:1}})
	if (user && user.is_king) {

		var room = Rooms.findOne({owner:user._id, type:'king'})
		if (room) {
			Roomchats.remove({room_id:room._id})
			Rooms.remove(room._id)
		}
	}
}



setupEveryoneChatroom = function() {
	var members = []
	Meteor.users.find({}, {fields:{_id:1}}).forEach(function(user) {
		members.push(user._id)
	})

	var room = Rooms.findOne({type:'everyone'})
	if (room) {
		Rooms.update(room._id, {$set: {members:members}})
	} else {
		createChatroom('Everyone', 'everyone', null, members)
	}
}

