var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
var army_fields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}
var village_fields = {
	name:1,
	user_id:1,
	x:1,
	y:1,
	username:1,
	castle_x:1,
	castle_y:1,
	castle_id:1,
	income:1,
	under_construction:1,
	created_at:1
}

_.each(s.army.types, function(type) {
	castle_fields[type] = 1
	army_fields[type] = 1
	village_fields[type] = 1
})




Meteor.publish('castle_user', function(user_id) {
	if(this.userId) {
		var fields = {username:1, num_allies_below:1, is_dominus:1, is_king:1, income:1, networth:1, losses_num:1}
		return Meteor.users.find(user_id, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('castleForHexInfo', function(id) {
	if(this.userId) {
		var sub = this
		var cur = Castles.find(id, {fields:castle_fields})
		Mongo.Collection._publishCursor(cur, sub, 'right_panel_castle')
		return sub.ready()
	} else {
		this.ready()
	}
})


Meteor.publish('armyForHexInfo', function(id) {
	if(this.userId) {
		var sub = this
		var cur = Armies.find(id, {fields:army_fields})
		Mongo.Collection._publishCursor(cur, sub, 'right_panel_armies')
		return sub.ready()
	} else {
		this.ready()
	}
})

Meteor.publish('villageForHexInfo', function(id) {
	if(this.userId) {
		var sub = this
		var cur = Villages.find(id, {fields:village_fields})
		Mongo.Collection._publishCursor(cur, sub, 'right_panel_villages')
		return sub.ready()
	} else {
		this.ready()
	}
})