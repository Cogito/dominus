Template.alerts_battle.helpers({
	battle: function() {
		if (this) {
			return Battles.findOne(this._id)
		}
	},

	isOpen: function() {
		return Template.instance().isOpen.get()
	}
})


Template.alerts_battle.events = alertSharedEvents
Template.alerts_battle.rendered = alertSharedRendered


Template.alerts_battle.created = function() {
	var self = this

	self.isOpen = new ReactiveVar(false)

	self.autorun(function() {
		if (Template.currentData()) {
			if (self.isOpen.get()) {
				Meteor.subscribe('battle', Template.currentData()._id)
			}
		}
	})
}
