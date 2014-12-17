Meteor.publish('forums', function() {
	if(this.userId) {
		return Forums.find()
	} else {
		this.ready()
	}
})

Meteor.publish('threads', function(forum_id) {
	if(this.userId) {
		return Threads.find({forum_id: forum_id})
	} else {
		this.ready()
	}
})

Meteor.publish('messages', function(thread_id) {
	if(this.userId) {
		return Messages.find({thread_id: thread_id})
	} else {
		this.ready()
	}
})

Meteor.publish('latest_forum_posts', function() {
	if (this.userId) {
		return Latestmessages.find()
	} else {
		this.ready()
	}
})




Forums.allow({insert: false, update: false, remove: false})
Threads.allow({insert: false, update: false, remove: false})
Messages.allow({insert: false, update: false, remove: false})
Latestmessages.allow({insert: false, update: false, remove: false})

Meteor.startup(function () {  
	Threads._ensureIndex({forum_id:1})
	Messages._ensureIndex({thread_id:1})
})