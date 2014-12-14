Template.lp_allies.helpers({
	allies: function() {
		return LeftPanelAllies.find({}, {sort:{income:-1}})
	}
})


Template.lp_ally.helpers({
	inBattle: function() {
		return Battles.findOne({x:this.x, y:this.y}, {fields: {_id:1}})
	},
})


Template.lp_ally.created = function() {
	if (Template.currentData()) {
		Meteor.subscribe('battle_notifications_at_hex', Template.currentData().x, Template.currentData().y)
	}
}