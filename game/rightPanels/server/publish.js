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
	created_at:1,
	level:1,
	constructionStarted:1
}

_.each(s.army.types, function(type) {
	castle_fields[type] = 1
	army_fields[type] = 1
	village_fields[type] = 1
})




// allies_below is required for army to tell if they're on a vassal's castle/village
// lord, x, y, castle_id are used in the tree
// Meteor.publish('castle_user', function(user_id) {
// 	if(this.userId) {
// 		var fields = {username:1, lord:1, x:1, y:1, castle_id:1, num_allies_below:1, allies_below:1, is_dominus:1, is_king:1, income:1, networth:1, losses_num:1}
// 		return Meteor.users.find(user_id, {fields: fields})
// 	} else {
// 		this.ready()
// 	}
// })


Meteor.publish('rightPanelUser', function(user_id) {
	if(this.userId) {
		var sub = this
		var fields = {username:1, lord:1, x:1, y:1, castle_id:1, num_allies_below:1, allies_below:1, is_dominus:1, is_king:1, income:1, networth:1, losses_num:1, "emails.verified":1}
		var cur = Meteor.users.find(user_id, {fields: fields})
		Mongo.Collection._publishCursor(cur, sub, 'rightPanelUser')
		return sub.ready()
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


Meteor.publish('rightPanelTree', function(user_id) {
	if(this.userId && user_id != this.userId) {
		var sub = this

		var user = Meteor.users.findOne(user_id, {fields: {allies_above:1}})
		if (user) {
			var fields = {name:1, x:1, y:1, castle_id:1, lord:1, username:1}

			var cur = Meteor.users.find({_id: {$in:user.allies_above}}, {fields: fields})
			Mongo.Collection._publishCursor(cur, sub, 'rightPanelTreeUsers')
		}

		return sub.ready()
	} else {
		this.ready()
	}
})
