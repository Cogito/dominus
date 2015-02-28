Meteor.publish('gather_resources_jobstat', function() {
	if (this.userId) {
		return CueStats.find({jobName:"gatherResources"}, {fields: {lastRunDate:1}})
	} else {
		this.ready()
	}
})

// if (Meteor.isServer) {
// 	Meteor.startup(function () {
// 		Jobstats._ensureIndex({job_name:1})
// 	})
// }
