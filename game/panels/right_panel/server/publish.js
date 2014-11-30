// used in rp_info_castle
Meteor.publish('castle_user', function(user_id) {
	if(this.userId) {
		var fields = {username:1, num_allies_below:1, is_dominus:1, is_king:1, income:1, networth:1, losses_worth:1}
		return Meteor.users.find(user_id, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('castleForHexInfo', function(castle_id) {
	var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}

	_.each(s.army.types, function(type) {
		castle_fields[type] = 1
	})

	if(this.userId) {
		return Castles.find(castle_id, {fields:castle_fields})
	} else {
		this.ready()
	}
})