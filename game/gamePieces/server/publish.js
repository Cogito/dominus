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
	var village_fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1, income:1}

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