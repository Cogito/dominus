total_of_buy = function(type, quantity) {
	check(type, String)
	check(quantity, Number)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "total_of_buy quantity !isFinite");
	}

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {
		var price = resource.price

		// for fractions
		// if (quantity - Math.floor(quantity) > 0 && quantity - Math.floor(quantity) < 1) {
		// 	var cost = (price + (price * s.market.increment)) * (quantity - Math.floor(quantity))
		// 	price += (price * s.market.increment) * (quantity - Math.floor(quantity))
		// } else {
		// 	var cost = 0
		// }

		// for (var n=1; n<=quantity; n++) {
		// 	cost += price
		// 	price += price * s.market.increment

		// }
		//p/r ((r+1)^x - 1)

		var cost = price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
		check(cost, Number)
		return cost
	}
	return false
}


total_of_buy_quick = function(quantity, price) {
	check(quantity, Number)
	check(price, Number)

	return cost = price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
}


total_of_sell = function(type, quantity) {
	check(type, String)
	check(quantity, Number)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "total_of_buy quantity !isFinite");
	}

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {

		var price = resource.price

		// //for fractions
		// if (quantity - Math.floor(quantity) > 0 && quantity - Math.floor(quantity) < 1) {
		// 	var cost = (price - (price * s.market.increment)) * (quantity - Math.floor(quantity))
		// 	price -= (price * s.market.increment) * (quantity - Math.floor(quantity))
		// 	cost = cost * (1 - s.market.sell_tax)
		// } else {
		// 	var cost = 0
		// }
		//
		// for (var n=1; n<=quantity; n++) {
		// 	cost += (price * (1 - s.market.sell_tax))
		// 	price -= price * s.market.increment
		//
		//
		// }

		return cost = price * (1 - s.market.sell_tax) * (1 - Math.pow(1 - s.market.increment, quantity)) / s.market.increment

		//var cost = (1 - s.market.sell_tax) * price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
		// var cost = price / s.market.increment * (Math.pow(0.9999, quantity) - 1)
		// check(cost, Number)
		return cost
	}
	return false
}



max_buy = function(gold, price) {
	check(gold, Number)
	check(price, Number)
	var base = Math.log(s.market.increment + 1)
	var log = Math.log(gold * s.market.increment / price + 1)
	var num = Math.floor(log / base)
	return num
}



// resource_formula = function(numWorkers) {
// 	check(numWorkers, Number)
// 	return (Math.log(numWorkers)+1) + (numWorkers * 0.01)
// }

// gold_gained_at_ally_castle = function(numWorkers) {
// 	check(numWorkers, Number)

// 	if (!isFinite(numWorkers)) {
// 		throw new Meteor.Error(404, "gold_gained_at_ally_castle numWorkers !isFinite");
// 	}

// 	if (numWorkers == 0) {
// 		return 0
// 	}

// 	var gained = s.resource.gold_gained_at_ally_castle * resource_formula(numWorkers)

// 	if (!isFinite(gained) || isNaN(gained)) { throw new Meteor.Error(0, 'number is NaN') }

// 	return gained
// }



// // resource gathering
// resources_gained = function(is_castle, distance, numWorkers) {
// 	check(is_castle, Boolean)
// 	check(distance, Number)
// 	check(numWorkers, Number)

// 	if (!isFinite(numWorkers)) {
// 		throw new Meteor.Error(404, "resources_gained numWorkers !isFinite");
// 	}

// 	if (is_castle) {
// 		numWorkers += 400
// 		var gained = s.resource.gained_at_castle * resource_formula(numWorkers)
// 		if (!isFinite(gained) || isNaN(gained)) {
// 			console.log(numWorkers)
// 			console.log(gained)
// 			throw new Meteor.Error(0, 'number is NaN')
// 		}
// 		return gained
// 	} else {
// 		if (distance == 0) {
// 			return 0
// 		}

// 		if (numWorkers == 0) {
// 			return 0
// 		}

// 		var dist1 = s.resource.distance_at_hex - distance + 1
// 		var dist2 = s.resource.distance_at_hex / distance
// 		if (dist1 < 0) {
// 			dist1 = 0
// 		}

// 		var gained = ((dist1 + dist2) / 2) * (s.resource.gained_at_hex * resource_formula(numWorkers))
// 		if (!isFinite(gained) || isNaN(gained)) { throw new Meteor.Error(0, 'number is NaN') }
// 		return gained
// 	}
// }
