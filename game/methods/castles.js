Meteor.methods({
	send_gold_to: function(user_id, amount) {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {gold:1, allies_below:1, username:1, castle_id:1, x:1, y:1}})
		if (user) {
			if (amount > user.gold) {
				return false
			}

			if (amount <= 0) {
				return false
			}

			if (_.indexOf(user.allies_below, user_id) != -1) {

				Meteor.users.update(user_id, {$inc: {gold: amount}})
				Meteor.users.update(Meteor.userId(), {$inc: {gold: amount * -1}})

				if (!this.isSimulation) {
					// get info for notification
					var to = Meteor.users.findOne(user_id, {fields: {gold:1, allies_below:1, username:1, castle_id:1, x:1, y:1}})
					if (to) {
						notification_sent_gold(user_id, {
							to: {_id: to._id, username: to.username, castle_id: to.castle_id, x: to.x, y: to.y},
							from: {_id: user._id, username: user.username, castle_id: user.castle_id, x: user.x, y: user.y}
						}, amount)
					}

					worker.enqueue('update_networth', {user_id: user_id})
					worker.enqueue('update_networth', {user_id: Meteor.userId()})
				}
				return true

			}
		}

		return false
	}
})