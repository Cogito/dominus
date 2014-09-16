Meteor.publish('battle_notifications_at_hex', function(x,y) {
	if (this.userId) {
		return Battles.find({x:x,y:y})
	} else {
		this.ready()
	}
})