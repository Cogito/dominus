if (Meteor.isClient) {
	LeftPanelAllies = new Mongo.Collection('left_panel_allies')
	LeftPanelLords = new Mongo.Collection('left_panel_lords')
}