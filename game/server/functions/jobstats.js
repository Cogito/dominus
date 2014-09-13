record_job_stat = function(job_name, time) {
	check(job_name, String)
	check(time, Number)
	
	var stat = Jobstats.findOne({job_name: job_name})
	
	if (stat) {
		Jobstats.update(stat._id, {$set: {time: time, updated_at: new Date()}})
	} else {
		Jobstats.insert({
			updated_at: new Date(),
			job_name: job_name,
			time: time
		})
	}
}