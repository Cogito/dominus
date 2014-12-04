Meteor.publish('networth_rankings', function() {
	var sub = this
	var cur = Meteor.users.find({}, {sort: {networth: -1}, fields: {
			networth:1,
			username:1,
			castle_id:1,
			x:1,
			y:1,
		}, limit:15})
	Mongo.Collection._publishCursor(cur, sub, 'networth_rankings')
	return sub.ready();
})

Meteor.publish('income_rankings', function() {
	var sub = this
	var cur = Meteor.users.find({}, {sort: {income: -1}, fields: {
			income:1,
			username:1,
			castle_id:1,
			x:1,
			y:1,
		}, limit:15})
	Mongo.Collection._publishCursor(cur, sub, 'income_rankings')
	return sub.ready();
})

Meteor.publish('ally_rankings', function() {
	var sub = this
	var cur = Meteor.users.find({}, {sort: {num_allies_below: -1}, fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			num_allies_below:1,
		}, limit:15})
	Mongo.Collection._publishCursor(cur, sub, 'ally_rankings')
	return sub.ready();
})

Meteor.publish('losses_rankings', function() {
	var sub = this
	var cur = Meteor.users.find({}, {sort: {losses_worth: -1}, fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			losses_worth:1
		}, limit:15})
	Mongo.Collection._publishCursor(cur, sub, 'losses_rankings')
	return sub.ready();
})

Meteor.publish('dominus_rankings', function() {
	var sub = this
	var cur = Meteor.users.find({is_dominus: true}, {fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			is_dominus:1
		}})
	Mongo.Collection._publishCursor(cur, sub, 'dominus_rankings')
	return sub.ready();
})


Meteor.publish('village_rankings', function() {
	var sub = this
	var cur = Villages.find({}, {sort: {"income.worth": -1}, fields: {
			username:1,
			name:1,
			castle_id:1,
			castle_x:1,
			castle_y:1,
			x:1,
			y:1,
			"income.worth":1
		}, limit:15})
	Mongo.Collection._publishCursor(cur, sub, 'village_rankings')
	return sub.ready();
})