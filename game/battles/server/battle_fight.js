Fight = function (x, y, unitObj, battleDb) {
	var start_time = new Date()
	var self = this
	self.x = x
	self.y = y
	self.unitObj = unitObj
	self.battleDb = battleDb

	var units = self.unitObj.getAllUnits()

	if (self.unitObj._someoneHasEnemies()) {
		_.each(units, function(unit) {
			if (self.unitObj.hasSoldiers(unit)) {
				if (self.unitObj.hasEnemies(unit)) {
					self._runFight(unit)
					self._killSoldiers(unit)
				}
			}
		})

		battleDb.saveRecord()
		self.unitObj.removeDeadSoldiers()
		self.unitObj.removeDeadUnits()
		self._sendEndBattleNotifications()
		self._endBattle()
	} else {
		self._endBattle()
	}

	record_job_stat('battle', new Date() - start_time)
}


Fight.prototype._sendEndBattleNotifications = function() {
	var self = this

	if (self._isBattleOver()) {
		// send notification to remaining units
		_.each(self.unitObj.getAllUnits(), function(unit) {
			self.unitObj.sendNotification(unit)
		})
	}
}


Fight.prototype._endBattle = function() {
	var self = this

	if (self._isBattleOver()) {
		// is there a castle in this hex
		// it might not be in allUnits so check mongodb
		var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
		_.each(s.army.types, function(type) {
			castle_fields[type] = 1
		})
		var castle = Castles.findOne({x:self.x, y:self.y}, {fields: castle_fields})
		
		if (castle) {
			castle.type = 'castle'
			var getsCastle = self._whoGetsCastle(castle)
			if (getsCastle) {
				var lord = Meteor.users.findOne(getsCastle.user_id)
				var vassal = Meteor.users.findOne(castle.user_id)
				if (lord && vassal) {
					set_lord_and_vassal(lord, vassal)
				}
			}
		}

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

	return !someoneHasAnEnemy
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
	var soldierPower = self._getPowerOfSoldiers(unit)

	// how much power worth of soldiers should we lose
	// combinedFinalPower is so that bigger battles lose more
	var combinedFinalPower = unit.final_power + enemyFinalPower

	if (unit.dif > 0) {
		var powerToLose = s.battle_power_lost_per_round_winner + (combinedFinalPower/1000)
	} else {
		var powerToLose = s.battle_power_lost_per_round + (combinedFinalPower/1000)
	}

	// take number of enemy armies into account
	var numEnemyArmies = self.unitObj.getNumUniqueEnemies(unit)
	var numTeamArmies = self.unitObj.getNumUniqueTeamMemebers(unit)
	var adjust = Math.max(1, numEnemyArmies / numTeamArmies)
	powerToLose = powerToLose * adjust
	check(powerToLose, validNumber)

	// shouldn't lose more than the enemy has
	powerToLose = Math.min(powerToLose, enemyFinalPower)
	check(powerToLose, validNumber)

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
		}

		// stop if failed max times
		if (numFailedTries >= maxFailedTries) {
			powerTakenAway = powerToLose
		}
	}
}


// how much final power is each soldier type worth
Fight.prototype._getPowerOfSoldiers = function(unit) {
	var soldierPower = {}
	_.each(s.army.types, function(type) {
		soldierPower[type] = unit.basePower[type] + unit.bonus[type]
		if (unit.castleDefenseBonus) {
			soldierPower[type] = soldierPower[type] * s.castle.defense_bonus
		}
		if (unit.villageDefenseBonus) {
			soldierPower[type] = soldierPower[type] * s.village.defense_bonus
		}
		if (unit.onAllyCastleBonus) {
			soldierPower[type] = soldierPower[type] * s.castle.ally_defense_bonus
		}
		if (unit.onAllyVillageBonus) {
			soldierPower[type] = soldierPower[type] * s.village.ally_defense_bonus
		}

		if (unit[type] == 0) {
			soldierPower[type] = 0
		} else {
			soldierPower[type] = soldierPower[type] / unit[type]
		}

		check(soldierPower[type], validNumber)
	})
	return soldierPower
}