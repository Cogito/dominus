Template.adminJobstats.helpers({
	jobstats: function() {
		return Jobstats.find({}, {sort: {time: -1}})
	}
})