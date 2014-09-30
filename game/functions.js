// used in Meteor.publish
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

is_hex_empty_except_allies_coords = function(x,y) {
    check(x, Number)
    check(y, Number)
    
    if (Castles.find({x:x, y:y}).count() > 0) {
		return false
	}

	if (Villages.find({x:x, y:y}).count() > 0) {
		return false
	}
    
    var user = Meteor.users.findOne(Meteor.userId(), {fields: {allies:1}})
    if (user) {
        var allies = user.allies
        allies.push(user._id)
        check(allies, Array)
        var numFound = Armies.find({x: x, y: y, user_id: {$nin: allies} }).count()
        if (numFound > 0) { return false }
        
        return true
    }
    
    return false
}



// it might be faster to just query minimongo instead of trying jquery
// would definatly be simpler
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