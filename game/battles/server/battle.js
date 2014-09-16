Battle = {
	// if no battle exists in this hex create one
	start_battle: function(x,y) {
		if (Battles.find({x:x,y:y}).count() == 0) {
			Battle.run_battle(x,y)
		}
	},

	// battle controller
	run_battle: function(x,y) {
		var self = this

		var battleDb = new BattleDb(x,y)
		var unitObj = new Units(x,y, battleDb)
		battleDb.unitObj = unitObj
		var fight = new Fight(x, y, unitObj, battleDb)
	}
}


