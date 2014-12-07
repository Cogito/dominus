Forums = new Meteor.Collection('forums')
Threads = new Meteor.Collection('threads')
Messages = new Meteor.Collection('messages')
Latestmessages = new Meteor.Collection('latestmessages')

if (Meteor.isServer) {
	Forums.allow({insert: false, update: false, remove: false})
	Threads.allow({insert: false, update: false, remove: false})
	Messages.allow({insert: false, update: false, remove: false})
	Latestmessages.allow({insert: false, update: false, remove: false})

	Meteor.startup(function () {  
		Threads._ensureIndex({forum_id:1})
		Messages._ensureIndex({thread_id:1})
	})
}