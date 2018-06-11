Template.lp_allies.helpers({
	allies: function() {
		return LeftPanelAllies.find({}, {sort:{income:-1}})
	}
})
