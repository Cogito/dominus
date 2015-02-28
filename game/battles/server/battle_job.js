Meteor.startup(function() {
	if (process.env.DOMINUS_WORKER == 'true') {

		Meteor.setInterval(function() {
			// if battle hasn't been updated in a while then run it
			var cutoff = moment().subtract(s.battle_interval, 'ms').toDate()
			Battles.find({isOver:false, updated_at: {$lt:cutoff}}, {fields: {x:1, y:1}}).forEach(function(battle) {
				Cue.addTask('runBattle', {isAsync:true, unique:true}, {x:battle.x, y:battle.y})
			})
		}, s.battle_check_interval)

	}
})
