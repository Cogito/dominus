Template.not_new_dominus.helpers({
	newDominus: function() {
		return this.vars._id === Meteor.userId()
	}
})
