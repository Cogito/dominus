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

// run nightly
Cue.addJob('updateNetForEveryone', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	updateNetForEveryone()
	done()
})

updateNetForEveryone = function() {
	var fields = {_id:1}
	Meteor.users.find({}, {fields:fields}).forEach(function(user) {
		updateNetworth_castle(user._id)
		updateNetworth_armies(user._id)
		updateNetworth_villages(user._id)
		updateNetworth_total(user._id)
	})
}


updateNetworth_total = function(userId) {
	var fields = {net:1}
	_.each(s.resource.types_plus_gold, function(type) {
		fields[type] = 1
	})
	var user = Meteor.users.findOne(userId, {fields:fields})

	if (user && user.net) {

		if (!user.net.armies) {
			Cue.addTask('updateNetArmies', {isAsync:true, unique:false}, {user_id:userId})
			return
		}
		if (!user.net.villages) {
			Cue.addTask('updateNetVillages', {isAsync:true, unique:false}, {user_id:userId})
			return
		}
		if (!user.net.castle) {
			Cue.addTask('updateNetCastle', {isAsync:true, unique:false}, {user_id:userId})
			return
		}

		// zero out soldiers
		var soldiers = {}
		_.each(s.army.types, function(type) {
			soldiers[type] = 0
		})

		// get soldier count
		_.each(s.army.types, function(type) {
			if (user.net.armies && user.net.armies[type]) {
				soldiers[type] += user.net.armies[type]
			}
			if (user.net.villages && user.net.villages[type]) {
				soldiers[type] += user.net.villages[type]
			}
			if (user.net.castle && user.net.castle[type]) {
				soldiers[type] += user.net.castle[type]
			}
		})

		var resources = {}
		_.each(s.resource.types_plus_gold, function(type) {
			resources[type] = user[type]
		})

		// convert villages to resources
		var villageLevelNames = _.keys(s.village.cost)
		_.each(villageLevelNames, function(name) {
			var numVillages = user.net.villages[name]
			if (numVillages > 0) {
				_.each(s.resource.types, function(type) {
					resources[type] += s.village.cost[name][type] * numVillages
				})
			}
		})

		// convert resources to gold
		var worth = resources.gold
		Market.find().forEach(function(res) {
			worth += res.price * resources[res.type]
		})

		check(worth, validNumber)
		Meteor.users.update(userId, {$set:{"net.total":worth}})
		Dailystats.upsert({user_id:user._id, created_at: {$gte: statsBegin(), $lt: statsEnd()}}, {$setOnInsert: {user_id:user._id, created_at: new Date()}, $set: {networth:worth, updated_at:new Date()}})
	}
}

updateNetworth_armies = function(userId) {
	var net = {}
	var fields = {}
	_.each(s.army.types, function(type) {
		net[type] = 0
		fields[type] = 1
	})

	Armies.find({user_id:userId}, {fields:fields}).forEach(function(army) {
		_.each(s.army.types, function(type) {
			net[type] += army[type]
		})
	})

	_.each(s.army.types, function(type) {
		check(net[type], validNumber)
	})

	Meteor.users.update(userId, {$set:{"net.armies":net}})
	Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
}


updateNetworth_villages = function(userId) {
	var fields = {level:1}
	var net = {}
	_.each(s.army.types, function(type) {
		fields[type] = 1
		net[type] = 0
	})

	// zero out villages
	// net.level1 = 0
	var villageLevelNames = _.keys(s.village.cost)
	_.each(villageLevelNames, function(name) {
		net[name] = 0
	})

	Villages.find({user_id:userId, level:{$gt:0}}, {fields:fields}).forEach(function(village) {
		_.each(s.army.types, function(type) {
			net[type] += village[type]
		})

		net['level'+village.level] ++
	})

	// check for errors
	_.each(s.army.types, function(type) {
		check(net[type], validNumber)
	})
	_.each(villageLevelNames, function(name) {
		check(net[name], validNumber)
	})

	Meteor.users.update(userId, {$set:{"net.villages":net}})
	Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
}


updateNetworth_castle = function(userId) {
	var fields = {level:1}
	var net = {}
	_.each(s.army.types, function(type) {
		fields[type] = 1
		net[type] = 0
	})

	var castle = Castles.findOne({user_id:userId}, {fields:fields})
	if (castle) {
		_.each(s.army.types, function(type) {
			net[type] += castle[type]
		})

		_.each(s.army.types, function(type) {
			check(net[type], validNumber)
		})

		Meteor.users.update(userId, {$set:{"net.castle":net}})
		Cue.addTask('updateNetTotal', {isAsync:true, unique:true}, {user_id:userId})
	}
}




// ---------------------------------------------



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
