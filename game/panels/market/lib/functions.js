total_of_buy = function(type, quantity) {
	check(type, String)
	check(quantity, validNumber)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "total_of_buy quantity !isFinite");
	}

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {
		var price = resource.price

		var cost = price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
		check(cost, validNumber)
		return cost
	}
	return false
}


total_of_buy_quick = function(quantity, price) {
	check(quantity, validNumber)
	check(price, validNumber)

	return cost = price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
}


total_of_sell = function(type, quantity) {
	check(type, String)
	check(quantity, validNumber)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "total_of_buy quantity !isFinite");
	}

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {

		var price = resource.price

		var cost = price * (1 - s.market.sell_tax) * (1 - Math.pow(1 - s.market.increment, quantity)) / s.market.increment
		check(cost, validNumber)
		return cost
	}
	return false
}



max_buy = function(gold, price) {
	check(gold, validNumber)
	check(price, validNumber)
	var base = Math.log(s.market.increment + 1)
	var log = Math.log(gold * s.market.increment / price + 1)
	var num = Math.floor(log / base)
	return num
}