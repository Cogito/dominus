Meteor.publish('admin_forums', function() {
	return Forums.find()
})

Meteor.publish('admin_charges', function() {
	return Charges.find()
})

Meteor.publish('admin_gamestats', function() {
	return Gamestats.find()
})

Meteor.publish('admin_jobstats', function() {
	return Jobstats.find()
})

Meteor.publish('admin_jobqueue', function() {
	return Jobqueue.find()
})