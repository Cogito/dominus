Meteor.publish('my_chatrooms', function(array_of_ids) {
	if(this.userId && array_of_ids && array_of_ids.length > 0) {
		check(array_of_ids, Array)
		return Chatrooms.find({_id: {$in: array_of_ids}})
	} else {
		this.ready()
	}
})

Meteor.publish('chats_in_room', function(chatroom_id) {
	if(this.userId) {
		return Chats.find({room_id: chatroom_id}, {sort: {created_at: -1}, limit: 100})
	} else {
		this.ready()
	}
})

Meteor.publish('latest_chats', function(array_of_room_ids) {
	if (this.userId) {
		check(array_of_room_ids, Array)
		return Latestchats.find({room_id: {$in: array_of_room_ids}})
	} else {
		this.ready()
	}
})