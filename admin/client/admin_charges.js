Template.admin_charges.helpers({
	charges: function() {
		return Charges.find()
	}
})