Meteor.publish('battle_notifications_at_hex', function(x,y) {
	if (this.userId) {
		return Battles.find({x:x,y:y})
	} else {
		this.ready()
	}
})

Meteor.publish('fight', function(id) {
	if (this.userId) {
		return Fights.find(id)
	} else {
		this.ready()
	}
})

Meteor.publish('lastFightInBattle', function(battle_id) {
	if (this.userId) {
		return Fights.find({battle_id:battle_id}, {sort:{roundNumber:-1}, limit:1})
	} else {
		this.ready()
	}
})

Meteor.publish('fighttitles', function(battle_id) {
	var sub = this
	var cur = Fights.find({battle_id:battle_id}, {fields: { roundNumber:1, battle_id:1 }})
	Mongo.Collection._publishCursor(cur, sub, 'fighttitles')
	return sub.ready()
})


Battles.allow({insert: false, update: false, remove: false})
Fights.allow({insert: false, update: false, remove: false})

Meteor.startup(function () {
	Battles._ensureIndex({x:1, y:1})
	Fights._ensureIndex({battle_id:1})
})
