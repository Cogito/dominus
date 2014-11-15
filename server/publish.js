Meteor.publish('on_screen_hexes', function (x, y, hex_size, canvas_width, canvas_height, hex_scale) {
	var max = max_onscreen(hex_size, canvas_width, canvas_height, hex_scale)

	return Hexes.find({
			x: {$gt: x - max, $lt: x + max},
			y: {$gt: y - max, $lt: y + max},
		}, {fields: {
			x: 1,
			y: 1,
			type: 1,
			tileImage:1,
			large:1
		}})
})

Meteor.publish("on_screen", function (x, y, hex_size, canvas_width, canvas_height, hex_scale) {
	var max = max_onscreen(hex_size, canvas_width, canvas_height, hex_scale)

	var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
	var army_fields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}
	var village_fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}

	_.each(s.army.types, function(type) {
		castle_fields[type] = 1
		army_fields[type] = 1
		village_fields[type] = 1
	})

	var castle_query = Castles.find({
		x: {$gt: x - max, $lt: x + max},
		y: {$gt: y - max, $lt: y + max},
	}, {fields: castle_fields})

	var armies_query = Armies.find({
		x: {$gt: x - max, $lt: x + max},
		y: {$gt: y - max, $lt: y + max},
	}, {fields: army_fields})

	var village_query = Villages.find({
		x: {$gt: x - max, $lt: x + max},
		y: {$gt: y - max, $lt: y + max},
	}, {fields: village_fields})

	return [castle_query, armies_query, village_query]
});


Meteor.publish('my_castle', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Castles.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('my_armies', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, to_x:1, to_y:1, from_x:1, from_x:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Armies.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('my_villages', function() {
	if(this.userId) {
		var fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		return Villages.find({user_id: this.userId}, {fields: fields})
	} else {
		this.ready()
	}
})

Meteor.publish('my_vassals', function(array) {
	check(array, Array)

	if(this.userId && array.length > 0) {
		return Meteor.users.find({_id: {$in: array}}, {fields: {
			username: 1,
			x: 1,
			y: 1,
			castle_id: 1,
			networth:1,
			num_vassals:1,
			num_allies: 1,
			num_allies_below:1,
			is_dominus:1,
			income:1,
			networth:1,
			lord:1,
			losses_worth:1
		}})
	} else {
		this.ready()
	}
})

Meteor.publish('my_lord', function(id) {
	if(this.userId) {
		if (id) {
			check(id, String)

			return Meteor.users.find(id, {fields: {
				username: 1,
				x: 1,
				y: 1,
				castle_id: 1,
				networth:1,
				num_vassals:1,
				num_allies: 1,
				num_allies_below:1,
				is_dominus:1,
				income:1,
				networth:1,
				lord:1,
				losses_worth:1
			}})
		}
	} else {
		this.ready()
	}
})

Meteor.publish('user_data', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {fields: {
			admin:1,
			allies:1,
			allies_above:1,
			allies_below:1,
			castle_id:1,
			chatrooms:1,
			clay:1,
			created_at:1,
			glass:1,
			gold:1,
			grain:1,
			is_dominus:1,
			is_king:1,
			lord:1,
			king_chatroom:1,
			lumber:1,
			num_allies:1,
			num_allies_above:1,
			num_allies_below:1,
			num_vassals:1,
			ore:1,
			res_update:1,
			show_welcome_screen:1,
			vassals:1,
			wool:1,
			x:1,
			y:1,
			king:1,
			siblings:1,
			team:1,
			lp_show_castle:1,
			lp_show_villages:1,
			lp_show_armies:1,
			lp_show_lord:1,
			lp_show_vassals:1,
			hex_scale:1,
			income:1,
			purchases:1,
			losses_worth:1,
			sp_show_coords:1,
			sp_show_minimap:1
		}})
	} else {
		this.ready()
	}
});

Meteor.publish('market', function() {
	if(this.userId) {
		return Market.find()
	} else {
		this.ready()
	}
})




Meteor.publish('my_dailystats', function() {
	if(this.userId) {
		return Dailystats.find({user_id: this.userId})
	} else {
		this.ready()
	}
})

Meteor.publish('markethistory', function() {
	if(this.userId) {
		return Markethistory.find({}, {sort: {created_at:-1}, limit: 240})
	} else {
		this.ready()
	}
})





Meteor.publish('admin_mailchimp_list', function() {
	if(this.userId) {
		return Meteor.users.find({}, {fields: {username:1, emails:1}})
	} else {
		this.ready()
	}
})

Meteor.publish('admin_users_online', function() {
	if(this.userId) {
		return Meteor.users.find({"status.online":true}, {fields: {username:1, "status.lastLogin.date":1, "status.online":1}})
	} else {
		this.ready()
	}
})





Meteor.publish('gather_resources_jobstat', function() {
	if (this.userId) {
		return Jobstats.find({job_name:"gather_resources_new"}, {fields: {updated_at:1}})
	} else {
		this.ready()
	}
})

Meteor.publish('army_moves', function(army_id) {
	if (this.userId) {
		return Moves.find({army_id:army_id, user_id:this.userId})
	} else {
		this.ready()
	}
})

Meteor.publish('user_moves', function() {
	if (this.userId) {
		return Moves.find({user_id:this.userId})
	} else {
		this.ready()
	}
})

Meteor.publish('store_charges', function() {
	if (this.userId) {
		return Charges.find({}, {fields: {amount:1}})
	} else {
		this.ready()
	}
})