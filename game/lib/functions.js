grid_to_pixel = function(x,y) {
	check(x, validNumber)
	check(y, validNumber)

	var canvas_size = Session.get('canvas_size')
	var hex_scale = Session.get('hexScale')

	if (canvas_size && hex_scale) {
		x -= canvas_size.width/2
		y -= canvas_size.height/2
		x = x * (1/hex_scale)
		y = y * (1/hex_scale)
		return {x:x, y:y}
	}

	return false
}


pixel_to_grid = function(x,y) {
	check(x, validNumber)
	check(y, validNumber)

	var canvas_size = Session.get('canvas_size')
	var hex_scale = Session.get('hexScale')

	if (canvas_size && hex_scale) {
		x += canvas_size.width/2
		y += canvas_size.height/2
		x = x * (hex_scale)
		y = y * (hex_scale)
		return {x:x, y:y}
	}

	return false
}


// empty if you're own army are there
// is_hex_empty_id = function(id) {
// 	check(id, String)
//
// 	var coords = id_to_coords(id, 'hex')
// 	return is_hex_empty_coords(coords.x, coords.y)
// }

is_hex_empty_coords = function(x,y) {
	check(x, validNumber)
	check(y, validNumber)

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
    check(x, validNumber)
    check(y, validNumber)

    if (Castles.find({x:x, y:y}).count() > 0) {
		return false
	}

	if (Villages.find({x:x, y:y}).count() > 0) {
		return false
	}

    var user = Meteor.users.findOne(Meteor.userId(), {fields: {allies_above:1, allies_below:1}})
    if (user) {
        var allies = _.union(user.allies_above, user.allies_below, [user._id])
        check(allies, Array)
        var numFound = Armies.find({x: x, y: y, user_id: {$nin: allies} }).count()
        if (numFound > 0) { return false }

        return true
    }

    return false
}




id_to_coords = function(id, type) {
	check(id, String)
	check(type, String)

	var coords = false

	switch (type) {
		case 'hex':
			var h = Hexes.findOne(id, {fields: {x:1, y:1}, reactive:false})
			if (h) {
				coords = {x: h.x, y: h.y }
			}

			break;

		case 'castle':
			var res = Castles.findOne(id, {fields: {x:1, y:1}, reactive:false})
			if (res) {
				coords = {x: res.x, y: res.y}
			}
			break;

		case 'village':
			var res = Villages.findOne(id, {fields: {x:1, y:1}, reactive:false})
			if (res) {
				coords = {x: res.x, y: res.y}
			}
			break;
	}

	return coords
}



coords_to_id = function(x, y, type) {
	check(x, validNumber)
	check(y, validNumber)
	check(type, String)

	var id = false

	switch (type) {
		case 'hex':
			var h = Hexes.findOne({x: x, y: y}, {fields: {_id:1}, reactive:false})
			if (h) {
				var id = h._id
				found = true
			}
			break;
	}

	return id
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
	check(numGrain, validNumber)
	check(numLumber, validNumber)
	check(numOre, validNumber)
	check(numWool, validNumber)
	check(numClay, validNumber)
	check(numGlass, validNumber)

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
		check(army[type], validNumber)
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
