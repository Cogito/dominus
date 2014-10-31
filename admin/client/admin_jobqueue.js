Template.adminJobqueue.helpers({
	jobs: function() {
		return Jobqueue.find({}, {sort: {created_at:-1}})
	}
})

Template.adminJobqueue.events({
	'click #empty_queue_button': function() {
		Meteor.call('admin_empty_jobqueue')
	}
})