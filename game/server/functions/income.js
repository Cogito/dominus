receive_income_id = function(user_id, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass, from_vassal) {
	check(user_id, String)
	check(numGold, Number)
	check(numGrain, Number)
	check(numLumber, Number)
	check(numOre, Number)
	check(numWool, Number)
	check(numClay, Number)
	check(from_vassal, Boolean)

	var user = Meteor.users.findOne(user_id, {fields: {lord:1}})
	if (user) {
		receive_income(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass, from_vassal)
	}
}



receive_income = function(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass, from_vassal) {
	check(user, Object)
	check(numGold, Number)
	check(numGrain, Number)
	check(numLumber, Number)
	check(numOre, Number)
	check(numWool, Number)
	check(numClay, Number)
	check(from_vassal, Boolean)

	if (user) {
		if (!isFinite(numGold)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numGrain)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numLumber)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numOre)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numWool)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numClay)) { throw new Meteor.Error(0, 'number is NaN') }
		if (!isFinite(numGlass)) { throw new Meteor.Error(0, 'number is NaN') }

		var has_lord = false
		if (user.lord) {
			var lord = Meteor.users.findOne(user.lord, {fields: {lord:1}})
			if (lord) {
				has_lord = true
			} 
		}

		if (has_lord) {
			var percentage = 1 - s.vassal_tax
		} else {
			var percentage = 1
		}


		cache_user_update(user._id,
			numGold * percentage,
			numGrain * percentage,
			numLumber * percentage,
			numOre * percentage, 
			numWool * percentage,
			numClay * percentage,
			numGlass * percentage,
			from_vassal
			)

		if (has_lord) {
			if (
				numGold * s.vassal_tax > 0.01 ||
				numGrain * s.vassal_tax > 0.01 ||
				numLumber * s.vassal_tax > 0.01 ||
				numOre * s.vassal_tax > 0.01 ||
				numWool * s.vassal_tax > 0.01 ||
				numClay * s.vassal_tax > 0.01 ||
				numGlass * s.vassal_tax > 0.01
			) {
				receive_income(
					lord,
					numGold * s.vassal_tax,
					numGrain * s.vassal_tax,
					numLumber * s.vassal_tax,
					numOre * s.vassal_tax,
					numWool * s.vassal_tax,
					numClay * s.vassal_tax,
					numGlass * s.vassal_tax,
					true
				)
			}
		}

	}
}