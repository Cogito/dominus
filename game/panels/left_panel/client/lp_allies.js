Template.lp_allies.helpers({
	allies: function() {
		return LeftPanelAllies.find({}, {sort:{networth:-1}})
	}
})