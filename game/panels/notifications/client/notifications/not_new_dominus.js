var isDominus = function() {
	return this.vars._id == Meteor.userId()
}
var isLastDominus = function() {
	return this.vars.oldDominusId == Meteor.userId()
}
Template.not_new_dominus.helpers({
	isDominus: isDominus,
	isLastDominus: isLastDominus,
	sameDominus: function() {
		return this.vars.oldDominusId == this.vars._id
	},
	notDominus: function() {
		return !isDominus.call(this) && !isLastDominus.call(this)
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
