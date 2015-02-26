Cue.addJob('updateEveryonesNetworth', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	Meteor.users.find({}, {fields:{_id:1}}).forEach(function(user) {
		update_networth(user._id)
	})
	done()
})


Cue.addJob('update_networth', {retryOnError:false, maxMs:1000*60*2}, function(task, done) {
	update_networth(task.data.user_id)
	done()
})


update_networth = function(user_id) {

	var user = Meteor.users.findOne(user_id)

	if (!user) {
		throw new Meteor.Error('User not found.')
	}

	check(user.gold, validNumber)
	check(user.grain, validNumber)
	check(user.lumber, validNumber)
	check(user.ore, validNumber)
	check(user.wool, validNumber)
	check(user.clay, validNumber)
	check(user.glass, validNumber)

	var worth = {
		gold: user.gold,
		grain: user.grain,
		lumber: user.lumber,
		ore: user.ore,
		wool: user.wool,
		clay: user.clay,
		glass: user.glass
	}

	var fields = {}
	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	// armies
	Armies.find({user_id: user._id}, {fields: fields}).forEach(function(army) {
		_.each(s.resource.types, function(t) {
			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * army[type]
			})
		})
	})

	check(worth.gold, validNumber)
	check(worth.grain, validNumber)
	check(worth.lumber, validNumber)
	check(worth.ore, validNumber)
	check(worth.wool, validNumber)
	check(worth.clay, validNumber)
	check(worth.glass, validNumber)

	var villageFields = _.extend(fields, {level:1})

	// villages and village garrison
	Villages.find({user_id: user._id}, {fields: villageFields}).forEach(function(res) {
		_.each(s.resource.types, function(t) {
			// villages are level 0 while they're being built
			if (res.level > 0) {
				worth[t] += s.village.cost['level'+res.level][t]
			}

			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * res[type]
			})
		})
	})

	check(worth.gold, validNumber)
	check(worth.grain, validNumber)
	check(worth.lumber, validNumber)
	check(worth.ore, validNumber)
	check(worth.wool, validNumber)
	check(worth.clay, validNumber)
	check(worth.glass, validNumber)

	// castle garrison
	Castles.find({user_id: user._id}, {fields: fields}).forEach(function(res) {
		_.each(s.resource.types, function(t) {
			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * res[type]
			})
		})
	})

	check(worth.gold, validNumber)
	check(worth.grain, validNumber)
	check(worth.lumber, validNumber)
	check(worth.ore, validNumber)
	check(worth.wool, validNumber)
	check(worth.clay, validNumber)
	check(worth.glass, validNumber)

	worth.total = worth.gold

	// convert to gold
	_.each(s.resource.types, function(t) {
		var m = Market.findOne({type: t}, {fields: {price: 1}})
		if (!m) { return false }
		worth.total += m.price * worth[t]
	})

	check(worth.total, validNumber)

	Dailystats.upsert({user_id: user_id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user_id, created_at: new Date()}, $set: {networth:worth.total, updated_at:new Date()}})
	Meteor.users.update(user_id, {$set: {networth: worth.total}})
}


Cue.addJob('update_num_allies', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	update_num_allies(task.data.user_id)
	done()
})

update_num_allies = function(user_id) {
	var user = Meteor.users.findOne(user_id, {fields: {num_allies_below:1}})
	if (user) {
		if (user.num_allies_below) {
			var num_allies_below = user.num_allies_below
		} else {
			var num_allies_below = 0
		}

		Dailystats.upsert({user_id: user_id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user_id, created_at: new Date()}, $set: {num_allies:num_allies_below, updated_at:new Date()}})
	}
}



Cue.addJob('update_losses_worth', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	update_losses_worth(task.data.user_id)
	done()
})

update_losses_worth = function(user_id) {

	var user = Meteor.users.findOne(user_id, {fields: {losses:1}})
	if (user) {
		// worth of losses in gold
		var worth = {gold: 0}

		_.each(s.resource.types, function(t) {
			worth[t] = 0
		})

		_.each(s.resource.types, function(t) {
			_.each(s.army.types, function(type) {
				if (user.losses[type]) {
					worth[t] += s.army.cost[type][t] * user.losses[type]
				}
			})
		})

		worth.total = worth.gold

		// convert to gold
		_.each(s.resource.types, function(t) {
			var m = Market.findOne({type: t}, {fields: {price: 1}})
			if (!m) { return false }
			worth.total += m.price * worth[t]
		})

		check(worth.total, validNumber)

		// number of soldiers
		var num = 0
		_.each(s.army.types, function(type) {
			if (user.losses[type]) {
				num += user.losses[type]
			}
		})

		check(num, validNumber)

		Dailystats.upsert({user_id: user_id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user_id, created_at: new Date()}, $set: {losses_worth:worth.total, losses_num:num, updated_at:new Date()}})
		Meteor.users.update(user_id, {$set: {losses_worth: worth.total, losses_num: num}})
	}
}



Cue.addJob('updateIncomeStats', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	updateIncomeStats()
	done()
})

updateIncomeStats = function() {
	var start_time = new Date()

	Meteor.users.find({}, {fields: {res_update:1}}).forEach(function(user) {
		var income = {}
		var vassalIncome = {}

		_.each(s.resource.types_plus_gold, function(type) {

			income[type] = 0
			vassalIncome[type] = 0

			if (user.res_update && user.res_update[type]) {
				income[type] = user.res_update[type]
			}

			if (user.res_update && user.res_update.from_vassal && user.res_update.from_vassal[type]) {
				vassalIncome[type] = user.res_update.from_vassal[type]
			}
		})


		Dailystats.upsert({
			user_id: user._id,
			created_at: {$gte: statsBegin(), $lt: statsEnd()}
		}, {
			$setOnInsert: {user_id:user._id, created_at: new Date()},
			$set: {inc:income, vassalInc:vassalIncome, updated_at:new Date()}
		})
	})

	record_job_stat('updateIncomeStats', new Date() - start_time)
}



Cue.addJob('updateIncomeRank', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	updateIncomeRank()
	done()
})

updateIncomeRank = function() {
	var start_time = new Date()

	var rank = 1
	var prevIncome = null
	Meteor.users.find({}, {sort: {income:-1}, fields: {income:1}}).forEach(function(user) {

		Dailystats.upsert({
			user_id: user._id,
			created_at: {$gte: statsBegin(), $lt: statsEnd()}
		}, {
			$setOnInsert: {user_id:user._id, created_at: new Date()},
			$set: {incomeRank:rank, updated_at:new Date()}
		})

		if (prevIncome) {
			if (prevIncome != user.income) {
				rank++
			}
		} else {
			rank++
		}

		prevIncome = user.income
	})

	record_job_stat('updateIncomeRank', new Date() - start_time)
}



init_dailystats_for_new_user = function(user_id) {
	var stat = {
		user_id: user_id,
		created_at: new Date(),
		updated_at: new Date(),
		inc: {
			gold:0,
			grain:0,
			lumber:0,
			ore:0,
			wool:0,
			clay:0,
			glass:0,
		},
		vassalInc: {
			gold:0,
			grain:0,
			lumber:0,
			ore:0,
			wool:0,
			clay:0,
			glass:0,
		},
		networth: 0,
		num_allies: 0,
		losses_worth:0,
		losses_num:0,
		incomeRank: Meteor.users.find().count()
	}
	Dailystats.insert(stat)
}
