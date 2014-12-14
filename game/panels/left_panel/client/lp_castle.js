Template.lp_castle.helpers({
	inBattle: function(x,y) {
		return Battles.findOne({x:x, y:y}, {fields: {_id:1}})
	},

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

	if (Template.currentData()) {
		Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
	}
}