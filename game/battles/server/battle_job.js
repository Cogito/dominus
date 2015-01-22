Meteor.startup(function() {
	if (process.env.DOMINUS_WORKER == 'true') {

		// for debug
		// Battles.find().forEach(function(battle) {
		// 	Battle.run_battle(battle.x, battle.y)
		// })

		Meteor.setInterval(function() {
			// if battle hasn't been updated in a while then run it
			var cutoff = moment().subtract(s.battle_interval, 'ms').toDate()
			Battles.find({isOver:false, updated_at: {$lt:cutoff}}, {fields: {x:1, y:1}}).forEach(function(battle) {
				Battle.run_battle(battle.x, battle.y)
			})
		}, s.battle_check_interval)

	}
})
