Meteor.publish('a_notification', function(id) {
	if(this.userId) {
		return Notifications.find(id)
	} else {
		this.ready()
	}
})

Meteor.publish('notifications_titles_mine', function() {
	var sub = this
	var cur = Notifications.find({user_id: this.userId}, {fields: {read:1, title:1, created_at:1, type:1}, sort: {created_at: -1}, limit: s.maxNotificationsPerUser})
	Mongo.Collection._publishCursor(cur, sub, 'notifications_titles_mine')
	return sub.ready();
})

Meteor.publish('notifications_titles_global', function() {
	var sub = this
	var types = [
			'battle',
			'new_dominus',
			'no_longer_dominus',
			'no_longer_dominus_new_user',
			'sent_gold',
			'sent_army'
			]
	var cur = Notifications.find({type: {$in: types}}, {fields: {user_id:1, read:1, title:1, created_at:1, type:1}, sort: {created_at: -1}, limit:s.maxNotificationsPerUser})
	Mongo.Collection._publishCursor(cur, sub, 'notifications_titles_global')
	return sub.ready();
})

Meteor.publish('notifications_unread', function() {
	var sub = this
	var cur = Notifications.find({user_id: this.userId, read:false}, {fields: {_id:1}})
	Mongo.Collection._publishCursor(cur, sub, 'notifications_unread')
	return sub.ready()
})

Meteor.publish('battle_notifications', function() {
	if (this.userId) {
		return Battles.find()
	} else {
		this.ready()
	}
})

Meteor.publish('gameEndDate', function() {
	if(this.userId) {
		return Settings.find({name: 'gameEndDate'})
	} else {
		this.ready()
	}
})

Meteor.publish('lastDominus', function() {
	var sub = this
	var lastDominusId = Settings.findOne({name: 'lastDominusUserId'})
	if (lastDominusId && lastDominusId.value) {
		var cur = Meteor.users.find(lastDominusId.value, {fields: {
			username:1,
			castle_id:1,
			x:1,
			y:1,
			is_dominus:1
		}})
		Mongo.Collection._publishCursor(cur, sub, 'lastDominus')
	}
	return sub.ready();
})



Meteor.startup(function () {
	Notifications._ensureIndex({user_id:1, type:1})
	Settings._ensureIndex({name:1})
})
