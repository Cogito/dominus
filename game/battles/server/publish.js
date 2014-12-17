Meteor.publish('battle_notifications_at_hex', function(x,y) {
	if (this.userId) {
		return Battles.find({x:x,y:y})
	} else {
		this.ready()
	}
})


Battles.allow({insert: false, update: false, remove: false})

Meteor.startup(function () {  
	Battles._ensureIndex({x:1, y:1})
})