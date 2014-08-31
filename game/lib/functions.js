max_onscreen = function(hex_size, canvas_width, canvas_height, hex_scale) {
	check(hex_size, Number)
	check(canvas_width, Number)
	check(canvas_height, Number)

	hex_size = hex_size * hex_scale

	var num_wide = canvas_width / (hex_size * 3/2)
	var num_high = canvas_height / ((Math.sqrt(3) * s.hex_squish) * hex_size)

	// this isn't exact at all
	// covers entire screen, hopefully not much more
	var max = Math.max(num_wide / 2 + 2, num_high / 2 + 2)
	//var max = Math.ceil(max / 5) * 5
	if (max > 16) {
		max = 16
	}

	return max
}


///////////////////////////////////////////////////////////////////////////////
// hex functions
///////////////////////////////////////////////////////////////////////////////

// take coords of a hex and return pixel the hex is at
// probably need to add half of screen size to this number
coordinates_to_grid = function(x, y) {
	check(x, Number)
	check(y, Number)

	var pixel_x = s.hex_size * 3/2 * x
	var pixel_y = s.hex_size * (Math.sqrt(3) * s.hex_squish) * (y + x/2)

	return {
		x: pixel_x,
		y: pixel_y
	}
}

// this isn't actually pixel to coordinates
// it's grid pos to coordinates
grid_to_coordinates = function(x, y) {
	check(x, Number)
	check(y, Number)

	var q = 2/3 * x / s.hex_size
	var r = (1/3 * (Math.sqrt(3) / s.hex_squish) * y - 1/3 * x) / s.hex_size

	// just rounding doesn't work, must convert to cube coords then round then covert to axial
	var cube = convert_axial_to_cube_coordinates(q,r)
	var round = round_cube_coordinates(cube.x, cube.y, cube.z)
	var axial = convert_cube_to_axial_coordinates(round.x, round.y, round.z)

	return {
		x:axial.x,
		y:axial.y
	}
}


grid_to_pixel = function(x,y) {
	check(x, Number)
	check(y, Number)

	var canvas_size = Session.get('canvas_size')
	var hex_scale = get_hex_scale()
	x -= canvas_size.half_width
	y -= canvas_size.half_height
	x = x * (1/hex_scale)
	y = y * (1/hex_scale)
	return {x:x, y:y}
}


pixel_to_grid = function(x,y) {
	check(x, Number)
	check(y, Number)

	var canvas_size = Session.get('canvas_size')
	var hex_scale = get_hex_scale()

	x += canvas_size.half_width
	y += canvas_size.half_height
	x = x * (hex_scale)
	y = y * (hex_scale)
	return {x:x, y:y}
}


convert_axial_to_cube_coordinates = function(q,r) {
	check(q, Number)
	check(r, Number)

	return {
		x: q,
		y: -1 * q - r,
		z: r
	}
}


convert_cube_to_axial_coordinates = function(x,y,z) {
	check(x, Number)
	check(y, Number)
	check(z, Number)

	return {x: x, y: z}
}


round_cube_coordinates = function(x,y,z) {
	check(x, Number)
	check(y, Number)
	check(z, Number)

	var rx = Math.round(x)
	var ry = Math.round(y)
	var rz = Math.round(z)

	var x_diff = Math.abs(rx - x)
	var y_diff = Math.abs(ry - y)
	var z_diff = Math.abs(rz - z)

	if (x_diff > y_diff && x_diff > z_diff) {
		rx = -1 * ry - rz
	} else if (y_diff > z_diff) {
		ry = -1 * rx - rz
	} else {
		rz = -1 * rx - ry
	}

	return {x: rx, y: ry, z: rz}
}



// number of hexes between two coords, not pixels
hex_distance = function(x1, y1, x2, y2) {
	check(x1, Number)
	check(y1, Number)
	check(x2, Number)
	check(y2, Number)

	return (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(x1 + y1 - x2 - y2)) / 2
}



// empty if you're own army are there
is_hex_empty_id = function(id) {
	check(id, String)

	var coords = id_to_coords(id, 'hex')
	return is_hex_empty_coords(coords.x, coords.y)
}

is_hex_empty_coords = function(x,y) {
	check(x, Number)
	check(y, Number)

	if (Castles.find({x:x, y:y}).count() > 0) {
		return false
	}

	if (Villages.find({x:x, y:y}).count() > 0) {
		return false
	}

	var res3 = Armies.find({x: x, y: y, user_id: {$ne: Meteor.userId()} }).count()
	if (res3 > 0) { return false }

	return true
}




id_to_coords = function(id, type) {
	check(id, String)
	check(type, String)

	switch (type) {
		case 'hex':
			var found = false

			if (Meteor.isClient) {
				var hex = $('.hex[data-id='+id+']')
				if (hex.length > 0) {
					var x = Number(hex.attr('data-x'))
					var y = Number(hex.attr('data-y'))

					if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) {
						found = true
						var coords = {
							x: x,
							y:y
						}
					}
				}
			}

			if (!found) {
				var h = Hexes.findOne(id, {fields: {x:1, y:1}})
				if (h) {
					var coords = {
						x: h.x,
						y: h.y
					}
					found = true
				}
			}

			break;

		case 'castle':
			var found = false

			if (Meteor.isClient) {
				var castle = $('.castle[data-id='+id+']')
				if (castle.length > 0) {
					var x = Number(castle.attr('data-x'))
					var y = Number(castle.attr('data-y'))

					if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) {
						found = true
						var coords = {
							x: x,
							y: y
						}
					}
				}
			}

			if (!found) {
				var res = Castles.findOne(id, {fields: {x:1, y:1}})
				if (res) {
					var coords = {
						x: res.x,
						y: res.y
					}
					found = true
				}
			}
			break;

		case 'village':
			var found = false

			if (Meteor.isClient) {
				var village = $('.village[data-id='+id+']')
				if (village.length > 0) {
					var x = Number(village.attr('data-x'))
					var y = Number(village.attr('data-y'))

					if (!isNaN(x) && isFinite(x) && !isNaN(y) && isFinite(y)) {
						found = true
						var coords = {
							x: x,
							y: y
						}
					}
				}
			}

			if (!found) {
				var res = Villages.findOne(id, {fields: {x:1, y:1}})
				if (res) {
					var coords = {
						x: res.x,
						y: res.y
					}
					fount = true
				}
			}
			break;
	}

	if (!found) {
		return false
	}

	if (coords) {
		return coords
	} else {
		throw new Meteor.Error(404, "couldn't find coordinats")
	}
	return false
}



coords_to_id = function(x, y, type) {
	check(x, Number)
	check(y, Number)
	check(type, String)

	switch (type) {
		case 'hex':
			var found = false

			if (Meteor.isClient) {
				var hex = $('.hex[data-x='+x+'][data-y='+y+']')
				if (hex.length > 0) {
					found = true
					var id = hex.attr('data-id')
				}
			}

			if (!found) {
				var h = Hexes.findOne({x: x, y: y}, {fields: {_id:1}})
				if (h) {
					var id = h._id
					found = true
				}
			}
			break;
	}

	if (!found) {
		return false
	}

	if (id) {
		return id
	}

	return false
}







seperate_number_with_commas = function(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

round_number = function(num) {
	return seperate_number_with_commas(Math.round(num))
}

round_number_1 = function(num) {
	return seperate_number_with_commas(Math.round(num * 10) / 10)
}

round_number_2 = function(num) {
	return seperate_number_with_commas(Math.round(num * 100) / 100)
}






resource_cost_army = function(army) {
	check(army, Object)

	var cost = {
		grain: 0,
		lumber: 0,
		ore: 0,
		wool: 0,
		clay: 0,
		glass: 0
	}

	_.each(army, function(num, type) {
		cost.grain += s.army.cost[type].grain * num
		cost.lumber += s.army.cost[type].lumber * num
		cost.ore += s.army.cost[type].ore * num
		cost.wool += s.army.cost[type].wool * num
		cost.clay += s.army.cost[type].clay * num
		cost.glass += s.army.cost[type].glass * num
	})

	return cost
}


// doesn't take into account that market is not linear
worth_of_army = function(army) {
	check(army, Object)
	var cost = resource_cost_army(army)
	return resources_to_gold(cost.grain, cost.lumber, cost.ore, cost.wool, cost.clay, cost.glass)
}


my_worth = function() {
	var user = Meteor.users.findOne(Meteor.userId(), {fields: {gold:1, grain:1, lumber:1, ore:1, wool:1, clay:1, glass:1}})
	if (user) {
		var value = user.gold
		Market.find({}, {fields: {price:1, type:1}}).forEach(function(resource) {
			value += resource.price * user[resource.type]
		})
		return value
	} else {
		throw new Meteor.Error(404, "Can't find user")
	}
}


// doesn't take into account that market is not linear
resources_to_gold = function(numGrain, numLumber, numOre, numWool, numClay, numGlass) {
	check(numGrain, Number)
	check(numLumber, Number)
	check(numOre, Number)
	check(numWool, Number)
	check(numClay, Number)
	check(numGlass, Number)

	var num = {
		grain: numGrain,
		lumber: numLumber,
		ore: numOre,
		wool: numWool,
		clay: numClay,
		glass: numGlass
	}

	worth = 0
	Market.find({}, {fields: {price:1, type:1}}).forEach(function(resource) {
		worth += resource.price * num[resource.type]
	})

	return worth
}



// distance_to_town_or_village = function(worker) {
// 	check(worker, Object)

// 	var c = Castles.findOne({user_id: worker.user_id}, {fields: {x:1, y:1}})
// 	if (!c) { return 0 }
// 	var distance = hex_distance(worker.x, worker.y, c.x, c.y)

// 	Villages.find({user_id: worker.user_id}, {fields: {x:1, y:1}}).forEach(function(v) {
// 		var d = hex_distance(worker.x, worker.y, v.x, v.y)
// 		if (d < distance) {
// 			distance = d
// 		}
// 	})

// 	return distance
// }



get_hexes_surrounding = function(x, y, num_rings) {
	check(x, Number)
	check(y, Number)

	var hexes = []

	var pos = {x:x, y:y}
	for (var k=1; k<=num_rings; k++) {
		pos = get_neighbor(pos.x, pos.y, 4)
		for (var i =  0; i < 6; i++) {		// change direction
			for (var j = 0; j < k; j++) {		// number to get in this direction
				hexes.push({x:pos.x, y:pos.y})
				pos = get_neighbor(pos.x, pos.y, i)
			}
		}
	}

	return hexes
}



// get x,y's neighbor
get_neighbor = function(x, y, direction) {
	switch(direction) {
		case 0:
			x = x + 1
			break;
		case 1:
			x = x + 1
			y = y - 1
			break;
		case 2:
			y = y - 1
			break;
		case 3:
			x = x - 1
			break;
		case 4:
			x = x - 1
			y = y + 1
			break;
		case 5:
			y = y + 1
			break;
	}

	return {x: x, y: y}
}



speed_of_army_id = function(id) {
	check(id, String)

	var fields = {}

	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	var army = Armies.findOne(id, {fields: fields})
	speed_of_army(army)
}

// speed of army in number of minutes it takes to cross one hex
speed_of_army = function(army) {
	_.each(s.army.types, function(type) {
		check(army[type], Number)
	})

	var army_speed = 1000
	_.each(s.army.types, function(type) {
		if (army[type] > 0) {
			if (s.army.stats[type].speed < army_speed) {
				army_speed = s.army.stats[type].speed
			}
		}
	})

	return (60 / army_speed) * s.army_travel_multiplier
}





// clone object before returning so that it doesn't return a reference
clone_object = function(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = obj.constructor(); // changed

	for(var key in obj)
		temp[key] = clone_object(obj[key]);
	return temp;
}



clone_array = function(arr) {
	return arr.slice(0)
}
