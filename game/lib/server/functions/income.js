receive_income_id = function(user_id, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass) {
	check(user_id, String)
	check(numGold, validNumber)
	check(numGrain, validNumber)
	check(numLumber, validNumber)
	check(numOre, validNumber)
	check(numWool, validNumber)
	check(numClay, validNumber)

	var user = Meteor.users.findOne(user_id, {fields: {allies_above:1}})
	if (user) {
		receive_income(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass)
	}
}


receive_income = function(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass) {
	check(user, Object)
	check(numGold, validNumber)
	check(numGrain, validNumber)
	check(numLumber, validNumber)
	check(numOre, validNumber)
	check(numWool, validNumber)
	check(numClay, validNumber)

	// get array of lord, lord's lord, his lord etc
	//var peopleAbove = getPeopleAbove(user._id)
	var numAbove = user.allies_above.length

	var has_lord = numAbove != 0

	if (numAbove <= s.income.maxToLords / s.income.percentToLords) {
		// 5% taken away for every lord above
		var percentPerLord = s.income.percentToLords
		var percentageUserGets = 1 - percentPerLord * numAbove
	} else {
		// 25%/numberOfLords to each lord
		var percentPerLord = s.income.maxToLords / numAbove
		var percentageUserGets = 1 - s.income.maxToLords
	}

	// give to user
	cache_user_update(user._id,
		numGold * percentageUserGets,
		numGrain * percentageUserGets,
		numLumber * percentageUserGets,
		numOre * percentageUserGets,
		numWool * percentageUserGets,
		numClay * percentageUserGets,
		numGlass * percentageUserGets,
		false
		)

	// give to lords
	_.each(user.allies_above, function(personAbove) {
		cache_user_update(
			personAbove,
			numGold * percentPerLord,
			numGrain * percentPerLord,
			numLumber * percentPerLord,
			numOre * percentPerLord,
			numWool * percentPerLord,
			numClay * percentPerLord,
			numGlass * percentPerLord,
			true
		)
	})
}


// // get array of lord, lord's lord, his lord etc
// getPeopleAbove = function(user_id) {
// 	arr = _getPeopleAbove(user_id, [])
// 	return arr
// }
//
// _getPeopleAbove = function(user_id, arr) {
// 	var user = Meteor.users.findOne(user_id, {fields: {lord:1}})
// 	if (user && user.lord) {
// 		arr.push(user.lord)
// 		arr.concat(_getPeopleAbove(user.lord, arr))
// 	}
// 	return arr
// }
