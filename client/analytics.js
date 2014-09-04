// category, action are required
logevent = function(category, action, label, value) {
	if (value) {
		ga('send', 'event', category, action, label, value)
	} else if (label) {
		ga('send', 'event', category, action, label)
	} else if (action) {
		ga('send', 'event', category, action)
	}
}

// todo: change this to store purchase
//
// log_gold_purchase = function(charge_id, amount_in_cents) {
// 	ga('ecommerce:addTransaction', {
// 		'id': charge_id,                     // Transaction ID. Required.
// 		'affiliation': s.game_name,   // Affiliation or store name.
// 		'revenue': amount_in_cents/100,               // Grand Total.
// 		'shipping': 0,                  // Shipping.
// 		'tax': 0                     // Tax.
// 	})

// 	ga('ecommerce:addItem', {
// 		'id': charge_id,                     // Transaction ID. Required.
// 		'name': s.stripe['gold_'+amount_in_cents]+' gold',    // Product name. Required.
// 		'price': amount_in_cents/100,                 // Unit price.
// 		'quantity': '1'                   // Quantity.
// 	})

// 	ga('ecommerce:send')
// }