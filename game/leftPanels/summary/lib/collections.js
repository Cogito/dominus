if (Meteor.isClient) {
	LeftPanelAllies = new Mongo.Collection('left_panel_allies')
	LeftPanelLords = new Mongo.Collection('left_panel_lords')
	LeftPanelCastle = new Mongo.Collection('left_panel_castle')
	LeftPanelVillages = new Mongo.Collection('left_panel_villages')
	LeftPanelArmies = new Mongo.Collection('left_panel_armies')
}