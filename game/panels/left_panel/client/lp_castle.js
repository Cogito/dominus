Template.lp_castle.helpers({
	castle: function() {
		var res = LeftPanelCastle.findOne()
		if (res) {
			res.unit_count = 0

			_.each(s.army.types, function(type) {
				res.unit_count += res[type]
			})

			return res
		}
		return false
	},
})

Template.lp_castle.created = function() {
	Meteor.subscribe('left_panel_castle')
}