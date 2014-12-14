Template.lp_lords.helpers({
	lords: function() {
		return LeftPanelLords.find({}, {sort:{income:-1}})
	}
})

Template.lp_lord.helpers({
	inBattle: function() {
		return Battles.findOne({x:this.x, y:this.y}, {fields: {_id:1}})
	},
})


Template.lp_lord.created = function() {
	if (Template.currentData()) {
		Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
	}
}