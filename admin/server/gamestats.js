// admin game stats
gamestats_job = function() {
	var start_time = new Date()

	var stat = Gamestats.findOne({created_at: {$gte: s.statsBegin, $lt: s.statsEnd}})

	if (!stat) {
		var stat = {
			created_at: new Date(),
			num_users: 0
		}
		stat._id = Gamestats.insert(stat)
	}


	// num users
	stat.num_users = Meteor.users.find().count()

	// total resources held
	var total_res = {}
	_.each(s.resource.types_plus_gold, function(type) {
		total_res[type] = 0
	})

	Meteor.users.find().forEach(function(user) {
		_.each(s.resource.types_plus_gold, function(type) {
			total_res[type] += user[type]
		})
	})

	_.each(s.resource.types_plus_gold, function(type) {
		check(total_res[type], validNumber)
		stat['total_'+type] = total_res[type]
	})


	// total army held
	var total_army = {}
	_.each(s.army.types, function(type) {
		total_army[type] = 0
	})

	Castles.find().forEach(function(res) {
		_.each(s.army.types, function(type) {
			total_army[type] += res[type]
		})
	})

	Villages.find().forEach(function(res) {
		_.each(s.army.types, function(type) {
			total_army[type] += res[type]
		})
	})

	Armies.find().forEach(function(res) {
		_.each(s.army.types, function(type) {
			total_army[type] += res[type]
		})
	})

	_.each(s.army.types, function(type) {
		check(total_army[type], validNumber)
		stat['total_'+type] = total_army[type]
	})


	// active users past 2 days
	var cutoff = moment().subtract(2, 'days').toDate()
	var num_active_users = Meteor.users.find({"status.lastLogin.date": {$gt: cutoff}}).count()
	check(num_active_users, validNumber)
	stat.num_active_users = num_active_users

	// average market price
	var price = 0
	var count = 0
	Market.find().forEach(function(resource) {
		price += resource.price
		count++
	})
	stat.avg_market_price = price / count
	check(stat.avg_market_price, validNumber)

	// number of chats
	stat.num_chats = Roomchats.find().count()

	// money earned
	var money = 0
	Charges.find().forEach(function(charge) {
		money += charge.amount
	})
	stat.money_earned = money / 100

	// users with same ip
	var ips = []
	var users_with_same = 0
	Meteor.users.find({"status.lastLogin.ipAddr": {$ne: "10.112.144.11"}}, {fields: {"status.lastLogin.ipAddr":1}}).forEach(function(user) {
		var ip = user.status.lastLogin.ipAddr
		if (ip) {
			if (_.indexOf(ips, user.status.lastLogin.ipAddr) == -1) {
				ips.push(ip)
			} else {
				users_with_same++
			}
		}
	})
	stat.users_with_duplicate_ip = users_with_same

	Gamestats.update(stat._id, stat)

	record_job_stat('gamestats', new Date() - start_time)
}
