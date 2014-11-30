Battles = new Meteor.Collection('battles')

if (Meteor.isServer) {
	Battles.allow({insert: false, update: false, remove: false})

	Meteor.startup(function () {  
		Battles._ensureIndex({x:1, y:1})
	})
}