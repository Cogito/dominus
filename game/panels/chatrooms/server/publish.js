Meteor.publish('myNormalChatrooms', function() {
	if(this.userId) {
		return Rooms.find({members:this.userId, type:'normal'})
	} else {
		this.ready()
	}
})


Meteor.publish('roomchats', function(chatroom_id) {
	if(this.userId) {
		return Roomchats.find({room_id: chatroom_id}, {sort: {created_at: -1}, limit: 100})
	} else {
		this.ready()
	}
})


// member_ids is an array of user_ids
Meteor.publish('room_members', function(member_ids) {
	var sub = this
	var cur = Meteor.users.find({_id: {$in:member_ids}}, {fields: {
		username: 1,
		x: 1,
		y: 1,
		castle_id: 1
	}})
	Mongo.Collection._publishCursor(cur, sub, 'room_members')
	return sub.ready();
})