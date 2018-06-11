total_of_buy = function(type, quantity) {
	check(type, String)
	check(quantity, validNumber)

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {
		var price = resource.price
		var cost = total_of_buy_quick(quantity, price)
		check(cost, validNumber)
		return cost
	}
	return false
}


total_of_buy_quick = function(quantity, price) {
	check(quantity, validNumber)
	check(price, validNumber)

	//return cost = price / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
	//return cost = price * (1) * (1 - Math.pow(1 - s.market.increment, quantity)) / s.market.increment
	return cost = price * (1+s.market.sell_tax) / s.market.increment * (Math.pow(s.market.increment + 1, quantity) - 1)
}


total_of_sell = function(type, quantity) {
	check(type, String)
	check(quantity, validNumber)

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {

		var price = resource.price

		var cost = price * (1 - Math.pow(1 - s.market.increment, quantity)) / s.market.increment
		check(cost, validNumber)
		return cost
	}
	return false
}



max_buy = function(gold, price) {
	check(gold, validNumber)
	check(price, validNumber)

	return Math.floor(max_buy_withoutRounding(gold, price))
	return num
}

max_buy_withoutRounding = function(gold, price) {
	check(gold, validNumber)
	check(price, validNumber)

	var base = Math.log(s.market.increment + 1)
	var log = Math.log(gold * s.market.increment / (price * (1+s.market.sell_tax)) + 1)
	var num = log / base
	return num
}
