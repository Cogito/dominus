Template.store_panel_item.helpers({
	_store: function() {
		return _store
	},

	name: function() {
		return _store[this.type][this.id].name
	},

	image: function() {
		return _store[this.type][this.id].image
	},

	price: function() {
		return _store[this.type][this.id].price
	},

	i_own: function() {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {purchases:1}})
		if (user && user.purchases && user.purchases[this.type]) {
			if (_.indexOf(user.purchases[this.type], this.id) != -1) {
				return true
			}
		}
		return false
	}
})



Template.store_panel_item.events({
	'click .store_purchase_button': function(event, template) {
		var self = this

		var button = $(event.currentTarget)
		var button_html = $(button).html()
		var error_alert = template.find('.store_error_alert')
		var amount_in_cents = _store[self.type][self.id].price * 100

		check(self.type, String)
		check(self.id, String)
		check(amount_in_cents, validNumber)

		$(error_alert).hide()

		$(button).attr('disabled', true)
		$(button).html('<i class="fa fa-refresh fa-spin"></i> Please Wait')

		var handler = StripeCheckout.configure({
			key: Meteor.settings.public.stripe_publishable_key,
			image: '/stripe_logo.jpg',
			token: function(token, args) {
				Meteor.call('stripe_purchase_checkout', amount_in_cents, self.type, self.id, token, function(error, charge_id) {
					if (error) {
						$(button).attr('disabled', false)
						$(button).html(button_html)
						$(error_alert).show()
						$(error_alert).html('Error charging card.  Card declined.')
					} else {
						//log_gold_purchase(charge_id, amount_in_cents)
						$(button).attr('disabled', false)
						$(button).html(button_html)
					}
				})
			}
		})

		handler.open({
			name: s.game_name,
			description: 'Purchase '+_store[self.type][self.id].name+' for $'+_store[self.type][self.id].price,
			amount: amount_in_cents,
			email: get_user_property("emails")[0].address
		})
	},
})
