Meteor.publish('store_charges', function() {
	if (this.userId) {
		return Charges.find({}, {fields: {amount:1, percentToWinner:1}})
	} else {
		this.ready()
	}
})
