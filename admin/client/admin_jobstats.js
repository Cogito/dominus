Template.admin_jobstats.helpers({
	jobstats: function() {
		return Jobstats.find({}, {sort: {time: -1}})
	}
})