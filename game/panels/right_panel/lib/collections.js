if (Meteor.isClient) {
	RightPanelCastle = new Mongo.Collection('right_panel_castle')
	RightPanelVillages = new Mongo.Collection('right_panel_villages')
	RightPanelArmies = new Mongo.Collection('right_panel_armies')
}