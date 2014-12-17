Template.lp_villages.helpers({
	villages: function() {
		return LeftPanelVillages.find({user_id:Meteor.userId()}, {sort: {name: 1}})
	},
})

Template.lp_village.helpers({
	unit_count: function() {
		var self = this
		var unit_count = 0
		_.each(s.army.types, function(type) {
			unit_count += self[type]
		})
		return unit_count
	}
})