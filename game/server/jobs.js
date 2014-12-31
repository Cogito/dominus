Meteor.startup(function() {
	if (process.env.DOMINUS_WORKER == 'true') {


		worker.empty_queue()
		worker.start()

		// army moves
		Meteor.setInterval(function() {
			var start_time = new Date()

			Moves.find({index:0}).forEach(function(move) {
				var army = Armies.findOne(move.army_id)
				if (army) {
					var army_speed = speed_of_army(army)
					if (moment(new Date(move.last_move_at)).add(army_speed, 'minutes') < moment()) {

						// we're somewhere along path
						// test until we find where
						var from_pos = Hx.coordinatesToPos(move.from_x, move.from_y, s.hex_size, s.hex_squish)
						var to_pos = Hx.coordinatesToPos(move.to_x, move.to_y, s.hex_size, s.hex_squish)

						// get distance
						var distance = Hx.hexDistance(move.from_x, move.from_y, move.to_x, move.to_y)

						// get move again to make sure it still exists
						move = Moves.findOne(move._id)
						if (move) {
							var move_army_to_next_hex = false
							var move_is_finished = false
							var foundArmyPosition = false

							// march along move
							for (i = 0; i <= distance; i++) {
								// pick point along line
								var x = from_pos.x * (1 - i/distance) + to_pos.x * i/distance
								var y = from_pos.y * (1 - i/distance) + to_pos.y * i/distance

								// find hex at point
								var coords = Hx.posToCoordinates(x, y, s.hex_size, s.hex_squish)

								// move army
								if (move_army_to_next_hex) {
									move_army_to_hex(army._id, coords.x, coords.y)
									move_army_to_next_hex = false
									Moves.update(move._id, {$set: {last_move_at:new Date()}})

									// check if this is last move
									if (coords.x == move.to_x && coords.y == move.to_y) {
										move_is_finished = true
									}
								}

								// is this the spot we're at?
								// if so then next time we loop move army
								if (army.x == coords.x && army.y == coords.y) {
									move_army_to_next_hex = true
									foundArmyPosition = true
								}
							}

							// if this is still false then the army isn't on the path
							// something is broke, move army to start of path to fix
							if (!foundArmyPosition) {
								move_army_to_hex(army._id, move.from_x, move.from_y)
								Moves.update(move._id, {$set: {last_move_at:new Date()}})
								console.log('Error: Army was not on path.')
							}

							// if this is last hex in this move
							if (move_is_finished) {
								// remove this move
								Moves.remove(move._id)

								// update index numbers and last_move_at of other moves
								var i = 0
								Moves.find({army_id:army._id}, {sort: {index:1}}).forEach(function(m) {
									Moves.update(m._id, {$set: {index:i, last_move_at:new Date()}})
									i++
								})
							}
						}
					}
				}
			})

			record_job_stat('army_moves', new Date() - start_time)
		}, s.army_update_interval)


		// village construction
		Meteor.setInterval(function() {
			var start_time = new Date()

			Villages.find({under_construction:true}, {fields: {created_at:1}}).forEach(function(village) {
				var finishAt = moment(new Date(village.created_at)).add(s.village.time_to_build, 'ms')
				if (moment().isAfter(finishAt)) {
					finish_building_village(village._id)
				}
			})

			record_job_stat('villageConstructionJob', new Date() - start_time)
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
			nightly_job()
			Meteor.setInterval(function() {
				nightly_job()
			}, 1000 * 60 * 60 * 24)
		}, timeUntilMidnight)



		// every 10 minute job
		var minute = moment().get('minute') % 10
		var time_til_next_tenMin = moment().add(10 - minute, 'minutes').seconds(0)

		Meteor.setTimeout(function() {
			tenMin_job()
			Meteor.setInterval(function() {
				tenMin_job()
			}, 1000 * 60 * 10)
		}, time_til_next_tenMin)

	}
})






resource_interval_jobs = function() {
	worker.enqueue('record_market_history', {quantity: 0})

	gather_resources_new()

	Meteor.users.find().forEach(function(user) {
		update_networth(user._id)
	})
}



nightly_job = function() {
	console.log('running nightly job at '+moment().format("dddd, MMMM Do YYYY, h:mm:ss a"))

	delete_old_notifications()
	resetJobStatRunCounter()

	Meteor.users.find().forEach(function(user) {
		update_num_allies(user._id)
		update_losses_worth(user._id)	// can remove this after next game starts
	})
}



tenMin_job = function() {
	gamestats_job()
	updateIncomeRank()
}
