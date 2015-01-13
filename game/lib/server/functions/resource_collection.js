gather_resources_new = function() {
	clear_cached_user_update()
	var start_time = new Date()

	Castles.find({}, {fields: {user_id:1}}).forEach(function(res) {
		receive_income_id(
			res.user_id,
			s.resource.gold_gained_at_castle,
			s.castle.income.grain,
			s.castle.income.lumber,
			s.castle.income.ore,
			s.castle.income.wool,
			s.castle.income.clay,
			s.castle.income.glass
			)
	})

	Villages.find({under_construction:false}, {fields: {user_id:1, x:1, y:1}}).forEach(function(res) {
		var income = gather_resources_surrounding(res.x, res.y, s.resource.num_rings_village, res.user_id, s.resource.gold_gained_at_village)

		// find worth for rankings and right panel
		income.worth = s.resource.gold_gained_at_village
		income.worth += resources_to_gold(income.grain, income.lumber, income.ore, income.wool, income.clay, income.glass)
		Villages.update(res._id, {$set: {income:income}})	// could this be made asynchronous? // it slows down this function
	})

	run_cached_user_update()
	record_job_stat('gather_resources_new', new Date() - start_time)
}


// optimization: store x and y as one field, 13_3 and use $in
gather_resources_surrounding = function(x, y, num_rings, user_id, gold) {
	check(x, validNumber)
	check(y, validNumber)
	check(num_rings, validNumber)
	check(gold, validNumber)

	var income = {
		grain:0,
		lumber:0,
		ore:0,
		wool:0,
		clay:0,
		glass:0
	}

	var hex_array = Hx.getSurroundingHexes(x, y, num_rings)
	var hexes = Hexes.find({x:{$gte: x-num_rings, $lte: x+num_rings}, y:{$gte: y-num_rings, $lte: y+num_rings}}, {fields: {x:1, y:1, type:1, large:1}})
	hexes.forEach(function(hex) {
		// is this hex in hex_array, hexes that we should be collecting from
		var h = _.find(hex_array, function(arr) {
			if (hex.x == arr.x && hex.y == arr.y) {
				return true
			} else {
				return false
			}
		})

		if (h) {
			if (hex.large) {
				var mult = s.resource.large_resource_multiplier
			} else {
				var mult = 1
			}

			switch(hex.type) {
				case 'grain':
					income.grain += s.resource.gained_at_hex
					break;
				case 'lumber':
					income.lumber += s.resource.gained_at_hex * mult
					break;
				case 'ore':
					income.ore += s.resource.gained_at_hex * mult
					break;
				case 'wool':
					income.wool += s.resource.gained_at_hex * mult
					break;
				case 'clay':
					income.clay += s.resource.gained_at_hex * mult
					break;
				case 'glass':
					income.glass += s.resource.gained_at_hex * mult
					break;
			}
		}

	})

	receive_income_id(user_id, gold, income.grain, income.lumber, income.ore, income.wool, income.clay, income.glass)

	income.gold = gold
	return income
}
