Markethistory = new Meteor.Collection('markethistory')
Market = new Meteor.Collection('market')

if (Meteor.isServer) {
	Market.allow({insert: false, update: false, remove: false})
	Markethistory.allow({insert: false, update: false, remove: false})
}