Template.adminJobstats.helpers({
	jobstats: function() {
		return Jobstats.find({}, {sort: {time: -1}})
	}
})


Template.adminJobstat.helpers({
	runTime: function() {
		if (this && this.runs && this.time) {
			return this.runs * this.time
		} else {
			return 0
		}
	}
})