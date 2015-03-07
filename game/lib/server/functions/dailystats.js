Cue.addJob('updateEveryonesNetworth', {retryOnError:false, maxMs:1000*60*10}, function(task, done) {
	Meteor.users.find().forEach(function(user) {
		update_networth(user)
	})
	done()
})


Cue.addJob('update_networth', {retryOnError:false, maxMs:1000*60*2}, function(task, done) {
	var user = Meteor.users.findOne(task.data.user_id)
	if (user) {
		update_networth(user)
		done()
	} else {
		done('user not found')
	}
})

// ----------- new

Cue.addJob('updateNetTotal', {retryOnError:false, maxMs:1000*10}, function(task, done) {
	updateNetworth_total(task.data.user_id)
	done()
})

Cue.addJob('updateNetCastle', {retryOnError:false, maxMs:1000*5}, function(task, done) {
	updateNetworth_castle(task.data.user_id)
	done()
})

Cue.addJob('updateNetArmies', {retryOnError:false, maxMs:1000*5}, function(task, done) {
	updateNetworth_armies(task.data.user_id)
	done()
})

Cue.addJob('updateNetVillages', {retryOnError:false, maxMs:1000*5}, function(task, done) {
	updateNetworth_villages(task.data.user_id)
	done()
})

Cue.addJob('updateNetUser', {retryOnError:false, maxMs:1000*5}, function(task, done) {
	updateNetworth_user(task.data.user_id)
	done()
})


updateNetworth_total = function(userId) {
	var fields = {net:1}
	var user = Meteor.users.findOne(userId, {fields:fields})

	if (user && user.net) {

		var getUserAgain = false

		if (typeof(user.net.armies) == 'undefined') {
			updateNetworth_armies(userId)
			getUserAgain = true
		}

		if (typeof(user.net.castle) == 'undefined') {
			updateNetworth_castle(userId)
			getUserAgain = true
		}

		if (typeof(user.net.villages) == 'undefined') {
			updateNetworth_villages(userId)
			getUserAgain = true
		}

		if (typeof(user.net.user) == 'undefined') {
			updateNetworth_user(userId)
			getUserAgain = true
		}

		if (getUserAgain) {
			var user = Meteor.users.findOne(userId, {fields:fields})
		}

		var worth = 0

		if (user.net.armies) {
			worth += user.net.armies
		}

		if (user.net.armies) {
			worth += user.net.villages
		}

		if (user.net.armies) {
			worth += user.net.castle
		}

		if (user.net.armies) {
			worth += user.net.user
		}

		check(worth, validNumber)
		Meteor.users.update(userId, {$set:{"net.total":worth}})
		Dailystats.upsert({user_id:user._id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user._id, created_at: new Date()}, $set: {networth:worth, updated_at:new Date()}})
	}
}

updateNetworth_armies = function(userId) {
	var fields = {}
	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	worth = {}
	_.each(s.resource.types, function(t) {
		worth[t] = 0
	})

	Armies.find({user_id:userId}, {fields:fields}).forEach(function(army) {
		_.each(s.resource.types, function(t) {
			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * army[type]
			})
			check(worth[t] , validNumber)
		})
	})

	worth.total = 0

	// convert to gold
	Market.find().forEach(function(resource) {
		worth.total += resource.price * worth[resource.type]
	})

	if (isNaN(worth.total)) {
		worth.total = 0
	}

	check(worth.total, validNumber)
	Meteor.users.update(userId, {$set:{"net.armies":worth.total}})
	Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
}


updateNetworth_villages = function(userId) {
	var fields = {level:1}
	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	worth = {}
	_.each(s.resource.types, function(t) {
		worth[t] = 0
	})

	Villages.find({user_id:userId}, {fields:fields}).forEach(function(village) {
		_.each(s.resource.types, function(t) {
			// villages are level 0 while they're being built
			if (village.level > 0) {
				worth[t] += s.village.cost['level'+village.level][t]
			}

			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * village[type]
			})
		})
	})

	worth.total = 0

	// convert to gold
	Market.find().forEach(function(resource) {
		worth.total += resource.price * worth[resource.type]
	})

	if (isNaN(worth.total)) {
		worth.total = 0
	}

	check(worth.total, validNumber)
	Meteor.users.update(userId, {$set:{"net.villages":worth.total}})
	Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
}


updateNetworth_castle = function(userId) {
	var fields = {}
	_.each(s.army.types, function(type) {
		fields[type] = 1
	})

	var castle = Castles.findOne({user_id:userId}, {fields:fields})
	if (castle) {
		worth = {}

		_.each(s.resource.types, function(t) {
			worth[t] = 0
			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * castle[type]
			})
		})

		worth.total = 0

		// convert to gold
		Market.find().forEach(function(resource) {
			worth.total += resource.price * worth[resource.type]
		})

		if (isNaN(worth.total)) {
			worth.total = 0
		}

		check(worth.total, validNumber)
		Meteor.users.update(userId, {$set:{"net.castle":worth.total}})
		Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
	}
}


updateNetworth_user = function(userId) {
	var fields = {}
	_.each(s.resource.types_plus_gold, function(type) {
		fields[type] = 1
	})

	var user = Meteor.users.findOne(userId, {fields:fields})
	if (user) {
		var worth = {}

		_.each(s.resource.types_plus_gold, function(type) {
			worth[type] = user[type]
		})

		worth.total = worth.gold

		// convert to gold
		Market.find().forEach(function(resource) {
			worth.total += resource.price * worth[resource.type]
		})

		if (isNaN(worth.total)) {
			worth.total = 0
		}

		check(worth.total, validNumber)
		Meteor.users.update(userId, {$set:{"net.user":worth.total}})
		Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
	}
}


update_networth = function(user) {

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

	// castle garrison
	var res = Castles.findOne({user_id: user._id}, {fields: fields})
	if (res) {
		_.each(s.resource.types, function(t) {
			_.each(s.army.types, function(type) {
				worth[t] += s.army.cost[type][t] * res[type]
			})
		})
	}

	// _.each(s.resource.types_plus_gold, function(type) {
	// 		check(worth[type], validNumber)
	// }

	worth.total = worth.gold

	// convert to gold
	Market.find().forEach(function(resource) {
		worth.total += resource.price * worth[resource.type]
	})

	check(worth.total, validNumber)

	Dailystats.upsert({user_id:user._id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user._id, created_at: new Date()}, $set: {networth:worth.total, updated_at:new Date()}})
	Meteor.users.update(user._id, {$set: {networth: worth.total}})
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
}




Cue.addJob('updateIncomeRank', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	updateIncomeRank()
	done()
})



updateIncomeRank = function() {
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
