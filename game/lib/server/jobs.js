Meteor.startup(function() {

	if (process.env.DOMINUS_WORKER == 'true') {

		Cue.dropInProgressTasks()
		Cue.start()

		// give all villages a level
		//Villages.update({}, {$set: {constructionStarted:new Date()}}, {multi:true})

		// cleanup old moves
		// Moves.find().forEach(function(move) {
		// 	if (Armies.find({_id:move.army_id}).count() == 0) {
		// 		console.log('removing move')
		// 		Moves.remove(move._id)
		// 	}
		// })


		// //set all emails to verified
		// Meteor.users.find().forEach(function(u) {
		// 	if (u.emails[0].verified == false) {
		// 		var emails = u.emails
		// 		emails[0].verified = true
		// 		Meteor.users.update(u._id, {$set: {emails:emails}})
		// 	}
		// })


		//make sure there are no negative armies
		var find = []
		_.each(s.army.types, function(type) {
			var or = {}
			or[type] = {$lt:0}
			find.push(or)
		})

		var castles = Castles.find({$or:find})
		var villages = Villages.find({$or:find})
		var armies = Armies.find({$or:find})

		castles.forEach(function(res) {
			_.each(s.army.types, function(type) {
				if (res[type] < 0) {
					console.log('castle '+res._id+' had '+res[type]+' '+type+'s')
					var set = {}
					set[type] = 0
					Castles.update(res._id, {$set:set})
				}
			})
		})

		villages.forEach(function(res) {
			_.each(s.army.types, function(type) {
				if (res[type] < 0) {
					console.log('village '+res._id+' had '+res[type]+' '+type+'s')
					var set = {}
					set[type] = 0
					Villages.update(res._id, {$set:set})
				}
			})
		})

		armies.forEach(function(res) {
			_.each(s.army.types, function(type) {
				if (res[type] < 0) {
					console.log('army '+res._id+' had '+res[type]+' '+type+'s')
					var set = {}
					set[type] = 0
					Armies.update(res._id, {$set:set})
				}
			})
		})






		// army moves
		Meteor.setInterval(function() {
			var start_time = new Date()
			Cue.addTask('armyMovementJob', {isAsync:false, unique:true}, {})
			record_job_stat('all_army_moves', new Date() - start_time)
		}, s.army_update_interval)


		// village construction
		Meteor.setInterval(function() {
			Cue.addTask('villageConstructionJob', {isAsync:false, unique:true}, {})
		}, s.village.construction_update_interval)



		// resources
		var max = 1000 * 60 * 60
		var current = moment().minute() * 60 * 1000

		if (current + s.resource.interval >= max) {
			var ms_until = max - current
		} else {
			var has_passed = Math.floor(current / s.resource.interval)
			var next = (has_passed + 1) * s.resource.interval
			var ms_until = next - current
		}

		Meteor.setTimeout(function() {
			resource_interval_jobs()
			Meteor.setInterval(function() {
				resource_interval_jobs()
			}, s.resource.interval)
		}, ms_until)



		// nightly job
		var endOfDay = moment().endOf('day').add(2, 'minutes')
		var timeUntilMidnight = endOfDay - moment()

		Meteor.setTimeout(function() {
			Meteor.setInterval(function() {

				resetJobStatRunCounter()

				// is this still needed?
				Meteor.users.find().forEach(function(user) {
					Cue.addTask('update_num_allies', {isAsync:false, unique:true}, {user_id:user._id})
				})

			}, 1000 * 60 * 60 * 24)
		}, timeUntilMidnight)



		// every 10 minute job
		var minute = moment().get('minute') % 10
		var time_til_next_tenMin = moment().add(10 - minute, 'minutes').seconds(0)

		Meteor.setTimeout(function() {
			Meteor.setInterval(function() {
				Cue.addTask('gamestats_job', {isAsync:false, unique:true}, {})
				Cue.addTask('updateIncomeRank', {isAsync:false, unique:true}, {})
				Cue.addTask('updateIncomeStats', {isAsync:false, unique:true}, {})
				Cue.addTask('generateTree', {isAsync:false, unique:true}, {})
			}, 1000 * 60 * 10)
		}, time_til_next_tenMin)


		// hourly job
		Meteor.setTimeout(function() {
			Cue.addTask('deleteInactiveUsers', {isAsync:false, unique:true}, {})
		}, 1000 * 60 * 60)


		// game over job
		// check to see if game is over and send alert
		Meteor.setTimeout(function() {
			Cue.addTask('checkForGameOver', {isAsync:false, unique:true}, {})
		}, 1000 * 60)
	}
})






resource_interval_jobs = function() {
	Cue.addTask('record_market_history', {isAsync:true, unique:false}, {quantity:0})
	gather_resources_new()
	Cue.addTask('updateEveryonesNetworth', {isAsync:false, unique:true}, {})
}
