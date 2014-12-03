Template.not_new_dominus.helpers({
	newDominus: function() {
		return this.vars._id === Meteor.userId()
	},
	ready: function () {
		return Template.instance().subReady.get()
	}
})

Template.not_new_dominus.created = function() {
	var self = this
	self.subReady = new ReactiveVar(false)
	self.autorun(function() {
		self.subReady.set(Meteor.subscribe("a_notification").ready())
	})
}
