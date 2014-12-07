Charges = new Meteor.Collection('charges')

if (Meteor.isServer) {
	Charges.allow({insert: false, update: false, remove: false})
}