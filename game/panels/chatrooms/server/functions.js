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