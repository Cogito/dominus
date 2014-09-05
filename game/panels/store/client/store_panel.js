Template.store_panel.helpers({
	_store: function() {
		return _store
	},

	prize_pool: function() {
		var pool = 0
		Charges.find().forEach(function(charge) {
			pool += charge.amount
		})
		return pool / 4 / 100
	}
})


Template.store_panel.events({
	'click #store_donate_button': function(event, template) {
		var button = $(event.currentTarget)
		var button_html = $(button).html()
		var error_alert = template.find('#donation_error_alert')
		var success_alert = template.find('#store_success_alert')
		var amount_in_cents = 1000

		$(error_alert).hide()
		$(success_alert).hide()

		$(button).attr('disabled', true)
		$(button).html('<i class="fa fa-refresh fa-spin"></i> Please Wait')

		var handler = StripeCheckout.configure({
			key: stripe_publishable_key,
			image: '/stripe_logo.jpg',
			token: function(token) {
				Meteor.call('stripe_donation_checkout', amount_in_cents, token, function(error, charge_id) {
					if (error) {
						$(button).attr('disabled', false)
						$(button).html(button_html)
						$(error_alert).show()
						$(error_alert).html('Error charging card.  Card declined.')
					} else {
						//log_gold_purchase(charge_id, amount_in_cents)
						$(button).attr('disabled', false)
						$(button).html(button_html)
						$(success_alert).show()
						$(success_alert).html('Donated $10. Thanks!')
					}
				})
			}
		})

		handler.open({
			name: s.game_name,
			description: 'Donate $10 to '+s.game_name,
			amount: amount_in_cents,
			email: get_user_property("emails")[0].address
		})
	}
})



Template.store_panel.rendered = function() {
	this.deps_store_charges = Deps.autorun(function() {
		Meteor.subscribe('store_charges')
	})
}

Template.store_panel.destroyed = function() {
	if (this.deps_store_charges) {
		this.deps_store_charges.stop()
	}
}