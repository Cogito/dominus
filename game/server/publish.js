Meteor.publish('gather_resources_jobstat', function() {
	if (this.userId) {
		return Jobstats.find({job_name:"gather_resources_new"}, {fields: {updated_at:1}})
	} else {
		this.ready()
	}
})