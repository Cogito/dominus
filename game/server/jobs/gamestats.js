gamestats_job = function() {
	var begin = moment().startOf('day').toDate()
	var end = moment().add('days', 1).startOf('day').toDate()

	var stat = Gamestats.findOne({created_at: {$gte: begin, $lt: end}})

	if (!stat) {
		var stat = {
			created_at: new Date(),
			num_users: 0
		}
		stat._id = Gamestats.insert(stat)
	}

	// num users
	stat.num_users = Meteor.users.find().count()

	// total gold held
	var total_gold = 0
	Meteor.users.find().forEach(function(user) {
		total_gold += user.gold
	})
	check(total_gold, Number)
	stat.total_gold = total_gold

	// active users past 2 days
	var cutoff = moment().subtract('days', 2).toDate()
	var num_active_users = Meteor.users.find({"status.lastLogin.date": {$gt: cutoff}}).count()
	check(num_active_users, Number)
	stat.num_active_users = num_active_users

	// average market price
	var price = 0
	var count = 0
	Market.find().forEach(function(resource) {
		price += resource.price
		count++
	})
	stat.avg_market_price = price / count
	check(stat.avg_market_price, Number)

	// number of chats
	stat.num_chats = Chats.find().count()

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
}
