Template.lp_villages.helpers({
	villages: function() {
		return LeftPanelVillages.find({}, {sort: {name: 1}})
	},
})

Template.lp_village.helpers({
	inBattle: function() {
		return Battles.findOne({x:this.x, y:this.y}, {fields: {_id:1}})
	},
	
	unit_count: function() {
		var self = this
		var unit_count = 0
		_.each(s.army.types, function(type) {
			unit_count += self[type]
		})
		return unit_count
	}
})


Template.lp_village.created = function() {
	if (Template.currentData()) {
		Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
	}
}