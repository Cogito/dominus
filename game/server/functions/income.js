receive_income_id = function(user_id, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass) {
	check(user_id, String)
	func.checkNumber(numGold)
	func.checkNumber(numGrain)
	func.checkNumber(numLumber)
	func.checkNumber(numOre)
	func.checkNumber(numWool)
	func.checkNumber(numClay)

	var user = Meteor.users.findOne(user_id, {fields: {lord:1}})
	if (user) {
		receive_income(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass)
	}
}


receive_income = function(user, numGold, numGrain, numLumber, numOre, numWool, numClay, numGlass) {
	check(user, Object)
	func.checkNumber(numGold)
	func.checkNumber(numGrain)
	func.checkNumber(numLumber)
	func.checkNumber(numOre)
	func.checkNumber(numWool)
	func.checkNumber(numClay)

	// get array of lord, lord's lord, his lord etc
	var peopleAbove = getPeopleAbove(user._id)
	var numAbove = peopleAbove.length

	var has_lord = numAbove != 0

	if (numAbove <= 5) {
		// 5% taken away for every lord above
		var percentPerLord = 0.05
		var percentageUserGets = 1 - percentPerLord * numAbove
	} else {
		// 25%/numberOfLords to each lord
		var percentPerLord = 0.25 / numAbove
		var percentageUserGets = 0.75
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
	_.each(peopleAbove, function(personAbove) {
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


// get array of lord, lord's lord, his lord etc
getPeopleAbove = function(user_id) {
	arr = _getPeopleAbove(user_id, [])
	return arr
}

_getPeopleAbove = function(user_id, arr) {
	var user = Meteor.users.findOne(user_id, {fields: {lord:1}})
	if (user && user.lord) {
		arr.push(user.lord)
		arr.concat(_getPeopleAbove(user.lord, arr))
	}
	return arr
}