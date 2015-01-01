// used in receive income so that user doesn't get updated as often
cached_user_changes = []

cache_user_update = function(user_id, gold, grain, lumber, ore, wool, clay, glass, from_vassal) {
	check(user_id, String)
	check(gold, validNumber)
	check(grain, validNumber)
	check(lumber, validNumber)
	check(ore, validNumber)
	check(wool, validNumber)
	check(clay, validNumber)
	check(glass, validNumber)
	check(from_vassal, Boolean)

	var user = _.find(cached_user_changes, function(u) {
		return user_id == u.user_id
	})

	if (!user) {
		if (from_vassal) {
			cached_user_changes.push({
				user_id: user_id,
				gold: gold,
				grain: grain,
				lumber: lumber,
				ore: ore,
				wool: wool,
				clay: clay,
				glass: glass,
				from_vassal: {
					gold:gold,
					grain:grain,
					lumber:lumber,
					ore:ore,
					wool:wool,
					clay:clay,
					glass:glass
				}
			})
		} else {
			cached_user_changes.push({
				user_id: user_id,
				gold: gold,
				grain: grain,
				lumber: lumber,
				ore: ore,
				wool: wool,
				clay: clay,
				glass: glass,
				from_vassal: {
					gold:0,
					grain:0,
					lumber:0,
					ore:0,
					wool:0,
					clay:0,
					glass:0
				}
			})
		}
	} else {
		cached_user_changes = _.reject(cached_user_changes, function(u) {
			return user_id == u.user_id
		})

		user.gold += gold
		user.grain += grain
		user.lumber += lumber
		user.ore += ore
		user.wool += wool
		user.clay += clay
		user.glass += glass

		if (from_vassal) {
			user.from_vassal.gold += gold
			user.from_vassal.grain += grain
			user.from_vassal.lumber += lumber
			user.from_vassal.ore += ore
			user.from_vassal.wool += wool
			user.from_vassal.clay += clay
			user.from_vassal.glass += glass
		}

		cached_user_changes.push(user)
	}
}


clear_cached_user_update = function() {
	cached_user_changes = []
}


run_cached_user_update = function() {
	var market = {}
	var m = Market.find({}, {fields: {price:1, type:1}})
	if (m && m.count() == s.resource.types.length) {
		m.forEach(function(res) {
			market[res.type] = res.price
		})
	} else {
		// no market? exit
		// happens when in new game
		return false
	}

	_.each(cached_user_changes, function(arr) {

		// get income for ranking
		var income = arr.gold
		_.each(s.resource.types, function(type) {
			income += arr[type] * market[type]
		})

		Meteor.users.update(arr.user_id, {
			$inc: {
				gold: arr.gold, // + arr.from_vassal.gold,
				grain: arr.grain, // + arr.from_vassal.grain,
				lumber: arr.lumber, // + arr.from_vassal.lumber,
				ore: arr.ore, // + arr.from_vassal.ore,
				wool: arr.wool, // + arr.from_vassal.wool,
				clay: arr.clay, // + arr.from_vassal.clay,
				glass: arr.glass, // + arr.from_vassal.glass
			},
			$set: {
				income: income,
				"res_update.gold": arr.gold,
				"res_update.grain": arr.grain,
				"res_update.lumber": arr.lumber,
				"res_update.ore": arr.ore,
				"res_update.wool": arr.wool,
				"res_update.clay": arr.clay,
				"res_update.glass": arr.glass,
				"res_update.from_vassal": arr.from_vassal
			}
		})

		var inc = {
			'income.gold':arr.gold,
			'income.grain':arr.grain,
			'income.lumber':arr.lumber,
			'income.ore':arr.ore,
			'income.wool':arr.wool,
			'income.clay':arr.clay,
			'income.glass':arr.glass,
			'vassal_income.gold':arr.from_vassal.gold,
			'vassal_income.grain':arr.from_vassal.grain,
			'vassal_income.lumber':arr.from_vassal.lumber,
			'vassal_income.ore':arr.from_vassal.ore,
			'vassal_income.wool':arr.from_vassal.wool,
			'vassal_income.clay':arr.from_vassal.clay,
			'vassal_income.glass':arr.from_vassal.glass,
		}

		var setOnInsert = {
			user_id:arr.user_id,
			created_at: new Date()
		}

		var set = {
			updated_at: new Date()
		}

		Dailystats.upsert({user_id: arr.user_id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert:setOnInsert, $inc:inc, $set:set})
	})
}
