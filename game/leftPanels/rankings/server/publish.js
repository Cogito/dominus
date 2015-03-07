Meteor.publish('playerCount', function() {
	return Settings.find({name:'playerCount'})
})

Meteor.publish('villageCount', function() {
	return Settings.find({name:'villageCount'})
})

Meteor.publish('networth_rankings', function(page) {
	var skip = (page-1) * s.rankings.perPage

	var sub = this
	var cur = Meteor.users.find({}, {skip:skip, sort: {"net.total": -1}, fields: {
			"net.total":1,
			username:1,
			castle_id:1,
			x:1,
			y:1,
		}, limit:s.rankings.perPage})
	Mongo.Collection._publishCursor(cur, sub, 'networth_rankings')
	return sub.ready()
})


Meteor.publish('income_rankings', function(page) {
	var skip = (page-1) * s.rankings.perPage

	var sub = this
	var cur = Meteor.users.find({}, {skip:skip, sort: {income: -1}, fields: {
			income:1,
			username:1,
			castle_id:1,
			x:1,
			y:1,
		}, limit:s.rankings.perPage})
	Mongo.Collection._publishCursor(cur, sub, 'income_rankings')
	return sub.ready();
})


Meteor.publish('ally_rankings', function(page) {
	var skip = (page-1) * s.rankings.perPage

	var sub = this
	var cur = Meteor.users.find({}, {skip:skip, sort: {num_allies_below: -1}, fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			num_allies_below:1,
		}, limit:s.rankings.perPage})
	Mongo.Collection._publishCursor(cur, sub, 'ally_rankings')
	return sub.ready();
})


Meteor.publish('losses_rankings', function(page) {
	var skip = (page-1) * s.rankings.perPage

	var sub = this
	var cur = Meteor.users.find({}, {skip:skip, sort: {losses_worth: -1}, fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			losses_worth:1,
			losses_num:1
		}, limit:s.rankings.perPage})
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


Meteor.publish('village_rankings', function(page) {
	var skip = (page-1) * s.rankings.perPage

	var sub = this
	var cur = Villages.find({under_construction:false}, {skip:skip, sort: {"income.worth": -1}, fields: {
			username:1,
			name:1,
			castle_id:1,
			castle_x:1,
			castle_y:1,
			x:1,
			y:1,
			"income.worth":1
		}, limit:s.rankings.perPage})
	Mongo.Collection._publishCursor(cur, sub, 'village_rankings')
	return sub.ready();
})
