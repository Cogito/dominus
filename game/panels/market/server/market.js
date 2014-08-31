Meteor.methods({
	
	reset_market: function() {
		if (Meteor.user().admin) {
			this.unblock()
			reset_market()
		}
	},


	stripe_buy_gold: function(amount_in_cents, token) {
		check(amount_in_cents, Number)

		var fut = new Future()
		var stripe = StripeAPI(Meteor.settings.stripe_secret_key)

		var amount = worth_of_army(s.stripe.num_footmen, s.stripe.num_archers, s.stripe.num_pikemen, s.stripe.num_cavalry) * s.stripe['gold_'+amount_in_cents]

		var charge = stripe.charges.create({
			amount: amount_in_cents,
			currency: "usd",
			card: token.id,
			description: Meteor.user().emails[0].address
		}, Meteor.bindEnvironment(function(err, charge) {
			//if (err && err.type === 'StripeCardError') {
			if (err) {
				fut['return'](false)
			} else {
				Meteor.users.update(Meteor.userId(), {$inc: {gold: amount}})

				//update_networth(Meteor.userId())
				worker.enqueue('update_networth', {user_id: Meteor.userId()})
				
				var id = Charges.insert({
					created_at: new Date(),
					user_id: Meteor.userId(),
					amount: amount_in_cents,
					gold: amount,
					user_email: Meteor.user().emails[0].address,
					user_username: Meteor.user().username,
					livemode: charge.livemode,
					stripe_charge_id: charge.id
				})

				fut['return'](id)
			}
		}))
		return fut.wait()
	},
})







//called after buying or selling resource to update market price
//buy is false if selling true if buying
update_market_price = function(type, quantity, buy) {
	check(type, String)
	check(quantity, Number)
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

		check(price, Number)

		Market.update(resource._id, {$set: {price: price}})
	}
}


record_market_history = function(quantity) {
	check(quantity, Number)

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