Meteor.publish('my_notifications', function() {
	if(this.userId) {
		return Notifications.find({user_id: this.userId}, {sort: {created_at: -1}, limit: 60})
	} else {
		this.ready()
	}
})

Meteor.publish('my_unread_notifications', function() {
	if(this.userId) {
		return Notifications.find({user_id: this.userId, read:false}, {fields: {_id:1, user_id:1, read:1}, sort: {created_at: -1}, limit: 20})
	} else {
		this.ready()
	}
})

Meteor.publish('global_notifications', function() {
	if (this.userId) {
		var types = [
			'battle',
			'now_dominus',
			'no_longer_dominus',
			'no_longer_dominus_new_user',
			'sent_gold',
			'sent_army'
			]
		return Notifications.find({type: {$in: types}}, {sort: {created_at: -1}, limit:80})
	} else {
		this.ready()
	}
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