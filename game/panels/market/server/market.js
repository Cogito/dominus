Meteor.methods({
	
	reset_market: function() {
		if (get_user_property("admin")) {
			this.unblock()
			reset_market()
		}
	},
})







//called after buying or selling resource to update market price
//buy is false if selling true if buying
update_market_price = function(type, quantity, buy) {
	check(type, String)
	check(quantity, validNumber)
	check(buy, Boolean)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "update_market_price quantity !isFinite");
	}

	var resource = Market.findOne({type: type}, {fields: {price:1}})
	if (resource) {
		var price = resource.price

		// if (buy) {

		// 	// for fractions
		// 	if (quantity - Math.floor(quantity) > 0 && quantity - Math.floor(quantity) < 1) {
		// 		price += (price * s.market.increment) * (quantity - Math.floor(quantity))
		// 	}

		// 	for (var n=1; n<=quantity; n++) {
		// 		price += price * s.market.increment
		// 	}

		// } else {

		// 	// for fractions
		// 	if (quantity - Math.floor(quantity) > 0 && quantity - Math.floor(quantity) < 1) {
		// 		price -= (price * s.market.increment) * (quantity - Math.floor(quantity))
		// 	}

		// 	for (var n=1; n<=quantity; n++) {
		// 		price -= price * s.market.increment
		// 	}

		// }

		if (!buy) {
			quantity = quantity * -1
		}

		price = price * Math.pow(s.market.increment + 1, quantity)

		check(price, validNumber)

		Market.update(resource._id, {$set: {price: price}})
	}
}


record_market_history = function(quantity) {
	check(quantity, validNumber)

	if (!isFinite(quantity)) {
		throw new Meteor.Error(404, "record_market_history quantity !isFinite");
	}

	var begin = moment().startOf('hour').toDate()
	var end = moment().endOf('hour').toDate()

	var stat = Markethistory.findOne({created_at: {$gte: begin, $lt: end}})

	if (stat) {
		var prev_quantity = stat.quantity
	} else {
		var prev_quantity = 0
		var stat = { created_at: new Date() }
		stat._id = Markethistory.insert(stat)
	}

	stat.price = {}
	Market.find({}, {fields: {price:1, type:1}}).forEach(function(m) {
		stat.price[m.type] = m.price
	})

	stat.quantity = prev_quantity + quantity

	Markethistory.update(stat._id, stat)
}




reset_market = function() {
	Market.remove({})
	Markethistory.remove({})

	Market.insert({
		type: 'grain',
		price: s.market.start_price.grain,
	})

	Market.insert({
		type: 'lumber',
		price: s.market.start_price.lumber,
	})

	Market.insert({
		type: 'ore',
		price: s.market.start_price.ore,
	})

	Market.insert({
		type: 'wool',
		price: s.market.start_price.wool,
	})

	Market.insert({
		type: 'clay',
		price: s.market.start_price.clay,
	})

	Market.insert({
		type: 'glass',
		price: s.market.start_price.glass,
	})
}