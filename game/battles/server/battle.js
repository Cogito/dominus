Battle = {
	// if no battle exists in this hex create one
	start_battle: function(x,y) {
		if (Battles.find({x:x,y:y,isOver:false}).count() == 0) {
			Battle.run_battle(x,y)
		}
	},

	// battle controller
	run_battle: function(x,y) {
		var self = this

		// get battle here
		var record = Battles.findOne({x:x, y:y, isOver:false})

		if (record) {
			// battle has already started
			// this is not the first round
			record.roundNumber++

		} else {
			// if there is no battle here then create one
			record = {
				x:x,
				y:y,
				created_at:new Date(),
				updated_at:new Date(),
				roundNumber: 1,
				deaths: [],
				currentUnits: null,
				isOver: false,
				sentStartAlertTo: [],

				// filled in at the end of the battle
				castleWasTaken: false,
				castle_id: null,
				castleTakenByArmy_id: null
			}
			record._id = Battles.insert(record)
		}

		var unitObj = new Units(x,y)
		var battleDb = new BattleDb(x,y, unitObj, record)
		unitObj.battleDb = battleDb
		battleDb.init()
		var fight = new Fight(x, y, unitObj, battleDb)
	}
}
