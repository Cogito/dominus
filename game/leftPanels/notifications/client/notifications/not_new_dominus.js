Template.not_new_dominus.helpers({
	isDominus: function() {
		if (this && this.vars) {
			return this.vars._id == Meteor.userId()
		}
	},
	isLastDominus: function() {
		if (this && this.vars) {
			return this.vars.oldDominusId == Meteor.userId()
		}
	},
	sameDominus: function() {
		if (this && this.vars) {
			return this.vars.oldDominusId == this.vars._id
		}
	},
	notDominus: function() {
		if (this && this.vars) {
			return this.vars._id != Meteor.userId() && this.vars.oldDominusId != Meteor.userId()
		}
	}
})