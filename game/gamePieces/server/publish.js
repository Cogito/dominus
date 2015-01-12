var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
var army_fields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1}
var village_fields = {name:1, user_id:1, x:1, y:1, username:1, under_construction:1}
var hex_fields = {x:1, y:1, type:1, tileImage:1, large:1}
var hexBakesFields = {posX:1, posY:1, filename:1, width:1, height:1, created_at:1}

_.each(s.army.types, function(type) {
	castle_fields[type] = 1
	army_fields[type] = 1
	village_fields[type] = 1
})

Meteor.publish('onScreenHexbakes', function(x, y, hex_size, canvas_width, canvas_height, hex_scale) {
	var max = max_onscreen(hex_size, canvas_width, canvas_height, hex_scale)
	max = max * 2
	var find = {
		centerX: {$gt: x - max, $lt: x + max},
		centerY: {$gt: y - max, $lt: y + max},
	}

	return Hexbakes.find(find, {fields: hexBakesFields})
})

Meteor.publish('on_screen_hexes', function (x, y, hex_size, canvas_width, canvas_height, hex_scale) {
	var max = max_onscreen(hex_size, canvas_width, canvas_height, hex_scale)

	return Hexes.find({
			x: {$gt: x - max, $lt: x + max},
			y: {$gt: y - max, $lt: y + max},
		}, {fields: hex_fields})
})

Meteor.publish("on_screen", function (x, y, hex_size, canvas_width, canvas_height, hex_scale) {
	var max = max_onscreen(hex_size, canvas_width, canvas_height, hex_scale)

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



max_onscreen = function(hex_size, canvas_width, canvas_height, hex_scale) {
	check(hex_size, validNumber)
	check(canvas_width, validNumber)
	check(canvas_height, validNumber)

	hex_size = hex_size * hex_scale

	var num_wide = canvas_width / (hex_size * 3/2)
	var num_high = canvas_height / ((Math.sqrt(3) * s.hex_squish) * hex_size)

	var max = Math.max(num_wide / 2 + 3, num_high / 2 + 3)

	return max
}





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


Meteor.publish('gamePiecesAtHex', function(x,y) {
	return [
		Hexes.find({x:x, y:y}, {fields: hex_fields}),
		Castles.find({x:x, y:y}, {fields: castle_fields}),
		Armies.find({x:x, y:y}, {fields: army_fields}),
		Villages.find({x:x, y:y}, {fields: village_fields})
	]
})





Hexes.allow({insert: false, update: false, remove: false})
Castles.allow({insert: false, update: false, remove: false})
Armies.allow({insert: false, update: false, remove: false})
Villages.allow({insert: false, update: false, remove: false})
Moves.allow({insert: false, update: false, remove: false})
Hexbakes.allow({insert: false, update: false, remove: false})

Meteor.startup(function () {
	Hexbakes._ensureIndex({centerX:1, centerY:1})
	Hexes._ensureIndex({x:1, y:1}, {unique:1})
	Castles._ensureIndex({user_id:1, x:1, y:1})
	Villages._ensureIndex({user_id:1, x:1, y:1})
	Armies._ensureIndex({x:1, y:1})
	Moves._ensureIndex({army_id:1, user_id:1})
})
