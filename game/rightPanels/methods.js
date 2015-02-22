Meteor.methods({
	edit_name: function(type, id, name) {
		var error = false

		if (name.length < 1) {
			throw new Meteor.Error('Name is too short.')
		}

		if (name.length > 30) {
			throw new Meteor.Error('Name must be less than 30 characters.')
		}


		name = _.clean(name)

		switch(type) {
			case 'castle':
				var res = Castles.findOne({_id:id, user_id:Meteor.userId()}, {fields: {user_id:1}})
				if (res) {
					if (res.user_id == Meteor.userId()) {
						Castles.update(id, {$set: {name: name}})
						return true
					}
				}
				break;
			case 'village':
				var res = Villages.findOne({_id:id, user_id:Meteor.userId()}, {fields: {user_id:1}})
				if (res) {
					if (res.user_id == Meteor.userId()) {
						Villages.update(id, {$set: {name: name}})
						return true
					}
				}
				break;
			case 'army':
				var res = Armies.findOne({_id:id, user_id:Meteor.userId()}, {fields: {user_id:1}})
				if (res) {
					if (res.user_id == Meteor.userId()) {
						Armies.update(id, {$set: {name: name}})
						return true
					}
				}
				break;
		}
	},


	send_gold_to: function(user_id, amount) {
		var user = Meteor.users.findOne(Meteor.userId(), {fields: {gold:1, allies_below:1, username:1, castle_id:1, x:1, y:1}})
		if (user) {
			amount = Number(amount)

			if (isNaN(amount)) {
				throw new Meteor.Error('Enter a number.')
			}

			if (amount > user.gold) {
				throw new Meteor.Error('You do not have enough gold.')
			}

			if (amount <= 0) {
				throw new Meteor.Error('Number must be greater than 0.')
			}

			if (_.indexOf(user.allies_below, user_id) != -1) {

				Meteor.users.update(user_id, {$inc: {gold: amount}})
				Meteor.users.update(Meteor.userId(), {$inc: {gold: amount * -1}})

				if (!this.isSimulation) {

					// send alert
					var from = user._id
					var to = user_id
					alert_receivedGoldFrom(to, from, amount)
					gAlert_sentGold(from, to, amount)

					worker.enqueue('update_networth', {user_id: user_id})
					worker.enqueue('update_networth', {user_id: Meteor.userId()})
				}
				return true

			}
		}

		return false
	}
})
