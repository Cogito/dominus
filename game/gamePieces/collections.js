Hexes = new Meteor.Collection('hexes')
Castles = new Meteor.Collection('castles')
Armies = new Meteor.Collection('armies')
Villages = new Meteor.Collection('villages')
Moves = new Meteor.Collection('moves')

if (Meteor.isServer) {
	Hexes.allow({insert: false, update: false, remove: false})
	Castles.allow({insert: false, update: false, remove: false})
	Armies.allow({insert: false, update: false, remove: false})
	Villages.allow({insert: false, update: false, remove: false})
	Moves.allow({insert: false, update: false, remove: false})

	Meteor.startup(function () {  
		Hexes._ensureIndex({x:1, y:1}, {unique:1})
		Castles._ensureIndex({user_id:1, x:1, y:1})
		Villages._ensureIndex({user_id:1, x:1, y:1})
		Armies._ensureIndex({x:1, y:1})
		Moves._ensureIndex({army_id:1})
	})
}