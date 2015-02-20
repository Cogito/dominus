Meteor.methods({
	set_unit_image: function(unit_id, image_type, image_id) {
		check(image_type, String)
		check(image_id, String)
		check(unit_id, String)

		var user_id = Meteor.userId()

		// is this image_type real
		if (_store[image_type]) {

			// is this id real
			if (_.indexOf(_store[image_type].types, image_id) == -1) {
				return false
			}

			// if user owns this image
			var user = Meteor.users.findOne(user_id, {fields: {purchases:1}})
			if (user && user.purchases && user.purchases[image_type]) {

				if (_.indexOf(user.purchases[image_type], image_id) != -1) {

					// set image
					switch(image_type) {
						case 'castles':
							Castles.update({user_id:user_id, _id:unit_id}, {$set: {image:image_id}})
							return true
							break;
					}
				}
			}

		}

		return false
	},

	stripe_purchase_checkout: function(amount_in_cents, type, id, token) {
		check(amount_in_cents, validNumber)
		check(type, String)
		check(id, String)
		check(token, Object)

		var fut = new Future()
		var stripe = StripeAPI(Meteor.settings.stripe_secret_key)

		var addToSet = {}
		addToSet['purchases.'+type] = id

		var charge = stripe.charges.create({
			amount: amount_in_cents,
			currency: "usd",
			card: token.id,
			description: get_user_property("emails")[0].address
		}, Meteor.bindEnvironment(function(err, charge) {
			//if (err && err.type === 'StripeCardError') {
			if (err) {
				fut['return'](false)
			} else {
				Meteor.users.update(Meteor.userId(), {$addToSet: addToSet})

				var id = Charges.insert({
					created_at: new Date(),
					user_id: Meteor.userId(),
					amount: amount_in_cents,
					type: 'store_purchase',
					user_email: get_user_property("emails")[0].address,
					user_username: get_user_property("username"),
					livemode: charge.livemode,
					stripe_charge_id: charge.id
				})

				fut['return'](id)
			}
		}))
		return fut.wait()
	},

	stripe_donation_checkout: function(amount_in_cents, percentToWinner, token) {
		check(amount_in_cents, validNumber)
		check(percentToWinner, validNumber)
		check(token, Object)

		var fut = new Future()
		var stripe = StripeAPI(Meteor.settings.stripe_secret_key)

		var charge = stripe.charges.create({
			amount: amount_in_cents,
			currency: "usd",
			card: token.id,
			description: get_user_property("emails")[0].address
		}, Meteor.bindEnvironment(function(err, charge) {
			//if (err && err.type === 'StripeCardError') {
			if (err) {
				fut['return'](false)
			} else {
				var id = Charges.insert({
					created_at: new Date(),
					user_id: Meteor.userId(),
					amount: amount_in_cents,
					percentToWinner: percentToWinner / 100,
					type: 'donation',
					user_email: get_user_property("emails")[0].address,
					user_username: get_user_property("username"),
					livemode: charge.livemode,
					stripe_charge_id: charge.id
				})

				fut['return'](id)
			}
		}))
		return fut.wait()
	},
})
