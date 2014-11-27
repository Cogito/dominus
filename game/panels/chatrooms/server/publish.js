Meteor.publish('myNormalChatrooms', function() {
	if(this.userId) {
		return Rooms.find({members:this.userId, type:'normal'})
	} else {
		this.ready()
	}
})

Meteor.publish('roomText', function(chatroom_id) {
	if(this.userId) {
		return Roomtext.find({room_id: chatroom_id}, {sort: {created_at: -1}, limit: 100})
	} else {
		this.ready()
	}
})