Template.lp_lords.helpers({
	lords: function() {
		return LeftPanelLords.find({}, {sort:{income:-1}})
	}
})