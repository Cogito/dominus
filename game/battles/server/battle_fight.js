Fight = function (x, y, unitObj, battleDb) {
	var self = this
	self.x = x
	self.y = y
	self.unitObj = unitObj
	self.battleDb = battleDb
	self.debug = false

	var units = self.unitObj.getAllUnits()

	// check to make sure battle should take place
	var doBattle = true

	// if this is the first round of battle
	if (self.battleDb.record.roundNumber == 1) {

		// if nobody has any enemies
		if (!self.unitObj._someoneHasEnemies()) {
			if (self.debug) {console.log('nobody has enemies')}

			// get castle
			// might not be in battle
			var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
			_.each(s.army.types, function(type) {
				castle_fields[type] = 1
			})
			var castle = Castles.findOne({x:self.x, y:self.y}, {fields: castle_fields})

			if (castle) {
				castle.type = 'castle'

				// does the castle have enemies
				var hasEnemies = false
				_.each(units, function(unit) {

					if (self.unitObj.isEnemy(castle, unit)) {
						hasEnemies = true
					}

					if (self.debug) {console.log('castle has enemies')}
				})

				// if not skip battle
				if (!hasEnemies) {
					doBattle = false
					if (self.debug) {console.log('castle has no enemies, skipping battle')}
				}
			}
		}
	}

	if (doBattle) {
		_.each(units, function(unit) {

			// send alert
			self.unitObj.enteredBattle(unit)

			if (self.unitObj.hasEnemies(unit)) {
				if (unit.type == 'castle') {
					if (self.unitObj.hasSoldiers(unit)) {
						self._runFight(unit)
						self._killSoldiers(unit)
					}
				} else {
					self._runFight(unit)
					self._killSoldiers(unit)
				}
			}
		})

		battleDb.saveRecord()
		self.unitObj.removeDeadSoldiers()
		self.unitObj.removeDeadUnits()
		self._endBattle()
	} else {

		// delete battle
		self.battleDb.deleteBattle()
	}
}

Fight.prototype._handleCastle = function() {
	var self = this

	// is there a castle in this hex
	// it might not be in allUnits so check mongodb
	var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
	_.each(s.army.types, function(type) {
		castle_fields[type] = 1
	})
	var castle = Castles.findOne({x:self.x, y:self.y}, {fields: castle_fields})

	if (castle) {
		self.battleDb.record.castle_id = castle._id
		castle.type = 'castle'
		var getsCastle = self._whoGetsCastle(castle)
		if (getsCastle) {
			var lord = Meteor.users.findOne(getsCastle.user_id)
			var vassal = Meteor.users.findOne(castle.user_id)
			if (lord && vassal) {
				set_lord_and_vassal(lord._id, vassal._id)
				self.battleDb.record.castleWasTaken = true
				self.battleDb.record.castleTakenByArmy_id = getsCastle._id
			}
		}

		self.battleDb.saveAfterCastleTaken()
	}
}



Fight.prototype._endBattle = function() {
	var self = this

	if (self._isBattleOver()) {
		self._handleCastle()
		self.battleDb.endBattle()
	}
}


Fight.prototype._whoGetsCastle = function(castle) {
	var self = this
	var armies = self.unitObj.getArmies()

	var oldest_date = moment(new Date()).add(1, 'years').toDate()
	var firstEnemyArmy = null

	_.each(armies, function(army) {
		if (self.unitObj.hasSoldiers(army)) {
			if (self.unitObj.isEnemy(castle, army)) {
				var last_move_at = new Date(army.last_move_at)
				if (last_move_at < oldest_date) {
					oldest_date = last_move_at
					firstEnemyArmy = army
				}
			}
		}
	})

	return firstEnemyArmy
}


Fight.prototype._isBattleOver = function() {
	var self = this
	var someoneHasAnEnemy = false

	var units = self.unitObj.getAllUnits()

	if (units.length < 2) {
		if (self.debug) {console.log('battle is over')}
		return true
	}

	_.each(units, function(unit) {
		// a castle might be in the fight still but have no soldiers
		if (self.unitObj.hasSoldiers(unit)) {
			if (self.unitObj.hasEnemies(unit)) {
				someoneHasAnEnemy = true
			}
		}
	})

	if (someoneHasAnEnemy) {
		if (self.debug) {console.log('battle is not over')}
		return false
	} else {
		if (self.debug) {console.log('battle is over')}
		return true
	}
}


Fight.prototype._runFight = function(unit) {
	var dif = this.unitObj.getTeamFinalPower(unit) - this.unitObj.getEnemyFinalPower(unit)
	check(dif, validNumber)
	this.unitObj.setDif(unit, dif)
}


Fight.prototype._killSoldiers = function(unit) {
	var self = this
	var enemyFinalPower = self.unitObj.getEnemyFinalPower(unit)

	// how much final power is each soldier type worth
	var soldierPower = self.unitObj.getPowerOfSoldiers(unit)

	// how much power worth of soldiers should we lose
	// combinedFinalPower is so that bigger battles lose more
	// var combinedFinalPower = unit.final_power + enemyFinalPower
	var combinedFinalPower = self.unitObj.getTotalFinalPower()

	// take number of enemy armies into account
	// if two armies attack one then one loses twice as much
	var numEnemyArmies = self.unitObj.getNumUniqueEnemies(unit)
	var numTeamArmies = self.unitObj.getNumUniqueTeamMemebers(unit)
	var adjust = Math.max(1, numEnemyArmies / numTeamArmies)

	if (unit.dif > 0) {

		// winner
		var powerToLose = s.battle_power_lost_per_round + (combinedFinalPower/1000)
		powerToLose = powerToLose * adjust
		powerToLose = Math.min(powerToLose, enemyFinalPower)
		powerToLose = powerToLose * s.battle_power_lost_winner_ratio

	} else {

		// tie or loser
		var powerToLose = s.battle_power_lost_per_round + (combinedFinalPower/1000)
		powerToLose = powerToLose * adjust

	}

	// set survivors to unit's current soldiers
	var survivors = {}
	_.each(s.army.types, function(type) {
		survivors[type] = unit[type]
	})

	// loop, take away at random until all dead are taken
	var powerTakenAway = 0
	var numFailedTries = 0
	var maxFailedTries = 5
	var unitsLeft = self.unitObj.getNumSoldiers(unit)
	check(unitsLeft, validNumber)

	while (powerTakenAway < powerToLose) {

		// pick a soldier type at random
		if (unitsLeft > 0) {
			// get which type of soldiers unit has
			var survivorTypes = []
			_.each(s.army.types, function(type) {
				if (survivors[type] > 0) {
					survivorTypes.push(type)
				}
			})

			var rand = Math.floor(Math.random() * survivorTypes.length)
			var type = survivorTypes[rand]

			check(survivors[type], validNumber)

			// take away solder if power lost less than powerToLose
			// unit can't lose more than powerToLose
			if (survivors[type] > 0) {
				if (powerTakenAway + soldierPower[type] <= powerToLose) {
					survivors[type]--
					self.unitObj.addToDead(unit, type, 1)
					powerTakenAway += soldierPower[type]
					unitsLeft--
				} else {
					numFailedTries++
				}
			}
		}

		// stop if everyone is dead
		if (unitsLeft == 0) {
			powerTakenAway = powerToLose
			unit.dead = true
		}

		// stop if failed max times
		if (numFailedTries >= maxFailedTries) {
			powerTakenAway = powerToLose
		}
	}
}
