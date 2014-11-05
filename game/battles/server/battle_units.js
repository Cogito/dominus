Units = function(x, y, battleDb) {
	var self = this
	self.battleDb = battleDb
	self.allUnits = []
	self.x = x
	self.y = y

	var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
	var army_fields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}
	var village_fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}

	_.each(s.army.types, function(type) {
		castle_fields[type] = 1
		army_fields[type] = 1
		village_fields[type] = 1
	})

	var armies = Armies.find({x:x, y:y}, {fields: army_fields})
	var castle = Castles.findOne({x:x, y:y}, {fields: castle_fields})
	var village = Villages.findOne({x:x, y:y}, {fields: village_fields})

	armies.forEach(function(army) {
		army.type = 'army'
		self.allUnits.push(army)
	})

	if (castle) {
		castle.type = 'castle'

		// castle must have soldiers to be in battle
		var hasSoldiers = false
		_.each(s.army.types, function(type) {
			if (castle[type] > 0) {
				hasSoldiers = true
			}
		})

		if (hasSoldiers) {
			self.allUnits.push(castle)
		}
	}

	if (village) {
		village.type = 'village'
		self.allUnits.push(village)
	}

	// set defaults
	_.each(self.allUnits, function(unit) {
		// soldiers lost this round
		unit.losses = {total:0}
		_.each(s.army.types, function(type) {
			unit.losses[type] = 0
		})
	})

	self._removeUnitsWithNoEnemies()
	self._findAttackersAndDefender()
	self._setArmyInfo()
	self._computeBonus()
	self._computeFinalPower()
	self._computeLocationBonus()
}





// unit must have an enemy to be in the battle
Units.prototype._removeUnitsWithNoEnemies = function() {
	var self = this

	_.each(self.allUnits, function(unit) {
		if (!self.hasEnemies(unit)) {
			self._removeFromAllUnits(unit)
		}
	})
}



Units.prototype.sendNotification = function(unit) {
	var self = this
	var record = Battles.findOne({x:self.x, y:self.y})
	record.unit = unit
	notification_battle(unit.user_id, record)
}


Units.prototype.removeDeadSoldiers = function() {
	var self = this

	var units = self.getAllUnits()
	_.each(units, function(unit) {
		var inc = {}
		_.each(s.army.types, function(type) {
			unit[type] -= unit.losses[type]
			unit.numUnits -= unit.losses[type]
			inc[type] = unit.losses[type] * -1
		})

		switch (unit.type) {
			case 'castle':
				Castles.update(unit._id, {$inc: inc})
				break
			case 'village':
				Villages.update(unit._id, {$inc: inc})
				break;
			case 'army':
				Armies.update(unit._id, {$inc: inc})
				break
		}
	})
}


Units.prototype.removeDeadUnits = function() {
	var self = this

	var units = self.getAllUnits()
	_.each(units, function(unit) {
		if (!self.hasSoldiers(unit)) {
			self.sendNotification(unit)
			self._removeFromAllUnits(unit)
			switch(unit.type) {
				case 'castle':
					break
				case 'village':
					Villages.remove(unit._id)
					break
				case 'army':
					Armies.remove(unit._id)
					break;
			}
		}
	})
}


Units.prototype.addToDead = function(unit, type, num) {
	var self = this
	check(num, validNumber)
	check(type, String)

	self.battleDb.addToLosses(unit, type, num)

	unit.losses[type] += num
	unit.losses.total += num
}


Units.prototype.getNumDead = function(unit) {
	check(unit.num_dead, validNumber)
	return unit.num_dead
}


Units.prototype.setNumDead = function(unit, numDead) {
	check(numDead, validNumber)
	unit.num_dead = numDead
}


Units.prototype.wonThisRound = function(unit) {
	if (unit.dif) {
		return unit.dif > 0
	} else {
		return undefined
	}
}


Units.prototype.setDif = function(unit, dif) {
	check(dif, validNumber)
	unit.dif = dif
}


Units.prototype.getTeamBasePower = function(unit) {
	var self = this

	var basePower = {total:0}
	_.each(s.army.types, function(type) {
		basePower[type] = 0
	})

	var allies = self.getAllies(unit)
	if (allies) {
		_.each(allies, function(ally) {
			_.each(s.army.types, function(type) {
				basePower[type] += ally.basePower[type]
				basePower.total += ally.basePower[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		basePower[type] += unit.basePower[type]
		basePower.total += unit.basePower[type]
	})

	_.each(s.army.types, function(type) {
		check(basePower[type], validNumber)
	})
	check(basePower.total, validNumber)

	return basePower
}


Units.prototype.getEnemyBasePower = function(unit) {
	var self = this

	var basePower = {total:0}
	_.each(s.army.types, function(type) {
		basePower[type] = 0
	})

	var enemies = self.getEnemies(unit)
	if (enemies) {
		_.each(enemies, function(enemy) {
			_.each(s.army.types, function(type) {
				basePower[type] += enemy.basePower[type]
				basePower.total += enemy.basePower[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		check(basePower[type], validNumber)
	})
	check(basePower.total, validNumber)

	return basePower
}


Units.prototype.getTeamBonus = function(unit) {
	var self = this

	var bonus = {total:0}
	_.each(s.army.types, function(type) {
		bonus[type] = 0
	})

	var allies = self.getAllies(unit)
	if (allies) {
		_.each(allies, function(ally) {
			_.each(s.army.types, function(type) {
				bonus[type] += ally.bonus[type]
				bonus.total += ally.bonus[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		bonus[type] += unit.bonus[type]
		bonus.total += unit.bonus[type]
	})

	_.each(s.army.types, function(type) {
		check(bonus[type], validNumber)
	})
	check(bonus.total, validNumber)

	return bonus
}


Units.prototype.getEnemyBonus = function(unit) {
	var self = this

	var bonus = {total:0}
	_.each(s.army.types, function(type) {
		bonus[type] = 0
	})

	var enemies = self.getEnemies(unit)
	if (enemies) {
		_.each(enemies, function(enemy) {
			_.each(s.army.types, function(type) {
				bonus[type] += enemy.bonus[type]
				bonus.total += enemy.bonus[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		check(bonus[type], validNumber)
	})
	check(bonus.total, validNumber)

	return bonus
}


Units.prototype.getTeamNumSoldiers = function(unit) {
	var self = this
	var numUnits = {total:0}
	_.each(s.army.types, function(type) {
		numUnits[type] = 0
	})

	var allies = self.getAllies(unit)
	if (allies) {
		_.each(allies, function(ally) {
			_.each(s.army.types, function(type) {
				numUnits[type] += ally[type]
				numUnits.total += ally[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		numUnits[type] += unit[type]
		numUnits.total += unit[type]
	})

	_.each(s.army.types, function(type) {
		check(numUnits[type], validNumber)
	})
	check(numUnits.total, validNumber)

	return numUnits
}


Units.prototype.getEnemyNumSoldiers = function(unit) {
	var self = this
	var numUnits = {total:0}
	_.each(s.army.types, function(type) {
		numUnits[type] = 0
	})

	var enemies = self.getEnemies(unit)
	if (enemies) {
		_.each(enemies, function(enemy) {
			_.each(s.army.types, function(type) {
				numUnits[type] += enemy[type]
				numUnits.total += enemy[type]
			})
		})
	}

	_.each(s.army.types, function(type) {
		check(numUnits[type], validNumber)
	})
	check(numUnits.total, validNumber)

	return numUnits
}


Units.prototype.getTeamFinalPower = function(unit) {
	var self = this
	var final_power = 0

	var allies = self.getAllies(unit)
	_.each(allies, function(ally) {
		final_power += ally.final_power
	})

	final_power += unit.final_power

	return final_power
}


Units.prototype.getEnemyFinalPower = function(unit) {
	var self = this
	var final_power = 0

	var enemies = self.getEnemies(unit)
	_.each(enemies, function(enemy) {
		final_power += enemy.final_power
	})

	return final_power 
}


// not used
//
// Units.prototype.getAlliesFinalPower = function(unit) {
// 	var self = this
// 	var final_power = 0

// 	var allies = self.getAllies(unit)
// 	_.each(allies, function(ally) {
// 		final_power += ally.final_power
// 	})

// 	return final_power 
// }


Units.prototype.hasSoldiers = function(unit) {
	return unit.numUnits > 0
}


Units.prototype.getNumSoldiers = function(unit) {
	return unit.numUnits
}

Units.prototype.getNumSoldiersMinusCatapults = function(unit) {
	return unit.numUnits - unit.catapults
}


Units.prototype.getCastle = function() {
	return _.find(this.allUnits, function(unit) {
		return unit.type == 'castle'
	})
}


Units.prototype.getArmies = function() {
	return _.filter(this.allUnits, function(unit) {
		return unit.type == 'army'
	})
}


Units.prototype.getVillage = function() {
	return _.find(this.allUnits, function(unit) {
		return unit.type == 'village'
	})
}


Units.prototype.getDefender = function() {
	return _.find(this.allUnits, function(unit) {
		return !unit.isAttacker
	})
}


Units.prototype.getAttackers = function() {
	return _.filter(this.allUnits, function(unit) {
		return unit.isAttacker
	})
}


Units.prototype.getAllUnits = function() {
	return this.allUnits
}


Units.prototype.getUserOfUnit = function(unit_id) {
	var unit = _.find(this.allUnits, function(unit) {
		if (unit._id == unit_id) {
			return true
		}
	})

	if (unit) {
		var user = Meteor.users.findOne(unit.user_id, {fields: {allies:1, team:1, allies_below:1, allies_above:1}})
		if (user) {
			return user
		}
	}
}


Units.prototype.hasEnemies = function(unit) {
	return  this.getEnemies(unit).length > 0
}


Units.prototype.getEnemies = function(unit) {
	var self = this

	return _.filter(self.allUnits, function(u) {
		return self.isEnemy(unit, u)
	})
}


Units.prototype.getNumUniqueEnemies = function(unit) {
	var self = this
	var units = self.getEnemies(unit)
	var numUnique = 0
	var checked = []
	_.each(units, function(u) {
		if (_.indexOf(checked, u._id) == -1) {
			numUnique++
			checked.push(u._id)
		}
	})
	return numUnique
}


Units.prototype.getNumUniqueTeamMemebers = function(unit) {
	var self = this
	var units = self.getAllies(unit)
	units.push(unit)
	var numUnique = 0
	var checked = []
	_.each(units, function(u) {
		if (_.indexOf(checked, u._id) == -1) {
			numUnique++
			checked.push(u._id)
		}
	})
	return numUnique
}


// find enemies of unit's enemies who are unit's allies
// just getting people who are allies is not enough
Units.prototype.getAllies = function(unit) {
	var self = this

	var enemies = self.getEnemies(unit)

	var enemyOfEnemies = []
	_.each(enemies, function(enemy) {
		_.each(self.getEnemies(enemy), function(enemyOfEnemy) {
			if (_.indexOf(enemyOfEnemies, enemyOfEnemy) == -1) {
				if (enemyOfEnemy._id != unit._id) {
					enemyOfEnemies.push(enemyOfEnemy)
				}
			}
		})
	})

	return _.filter(enemyOfEnemies, function(u) {
		return self.isAlly(unit, u)
	})
}


Units.prototype.isAlly = function(unit, otherUnit) {
	check(unit, Object)
	check(otherUnit, Object)
	var self = this

	if (unit.user_id == otherUnit.user_id) {
		return false
	}

	var isAlly = false
	var user = Meteor.users.findOne(unit.user_id, {fields: {allies:1, team:1, allies_below:1, allies_above:1}})

	if (user) {
		switch (unit.type) {
			case 'castle':

				// allies are people above you
				if (_.indexOf(user.allies_above, otherUnit.user_id) != -1) {
					isAlly = true
				}
				break

			case 'village':
			case 'army':

				if (otherUnit.type == 'castle') {
					// allies are castles below you
					if (_.indexOf(user.allies_below, otherUnit.user_id) != -1) {
						isAlly = true
					}
				} else {
					// anyone in allies
					if (_.indexOf(user.allies, otherUnit.user_id) != -1) {
						isAlly = true
					}
				}
				break
		}
	}

	return isAlly
}


Units.prototype.isEnemy = function(unit, otherUnit) {
	check(unit, Object)
	check(otherUnit, Object)
	var self = this

	if (unit.user_id == otherUnit.user_id) {
		return false
	}

	var isEnemy = false
	var user = Meteor.users.findOne(unit.user_id, {fields: {allies:1, team:1, allies_below:1, allies_above:1, is_dominus:1}})
	var otherUser = Meteor.users.findOne(otherUnit.user_id, {fields: {is_dominus:1}})
	if (user && otherUser) {

		// dominus' armies can attack all other armies
		if (user.is_dominus || otherUser.is_dominus) {
			if (unit.type == 'army' && otherUnit.type == 'army') {
				isEnemy = true	
			}
		}

		if (!isEnemy) {
			switch (unit.type) {
				case 'castle':
					
					if (_.indexOf(user.allies_above, otherUnit.user_id) == -1) {
						isEnemy = true
					}
					break

				case 'village':
				case 'army':
					if (otherUnit.type == 'castle') {
						if (_.indexOf(user.team, otherUnit.user_id) == -1) {
							isEnemy = true
						} else {
							if (_.indexOf(user.allies_below, otherUnit.user_id) == -1) {
								isEnemy = true
							}
						}
					} else {
						if (_.indexOf(user.allies, otherUnit.user_id) == -1) {
							isEnemy = true
						}
					}
					break
			}
		}
		
	}

	return isEnemy
}








///////////////////////////////////////////////////////
// internal

Units.prototype._removeFromAllUnits = function(unit) {
	var self = this
	self.allUnits = _.reject(self.allUnits, function(u) {
		if (unit == u) {
			return true
		}
		return false
	})
}


Units.prototype._computeLocationBonus = function() {
	var self = this

	_.each(self.allUnits, function(unit) {
		unit.castleDefenseBonus = false
		unit.villageDefenseBonus = false
		unit.onAllyCastleBonus = false
		unit.onAllyVillageBonus = false

		if (unit.type == 'castle') {
			unit.final_power = unit.final_power * s.castle.defense_bonus
			unit.castleDefenseBonus = true
		}

		if (unit.type == 'village') {
			unit.final_power = unit.final_power * s.village.defense_bonus
			unit.villageDefenseBonus = true
		}

		if (self._isOnAllyCastle(unit)) {
			unit.final_power = unit.final_power * s.castle.ally_defense_bonus
			unit.onAllyCastleBonus = true
		}

		if (self._isOnAllyVillage(unit)) {
			unit.final_power = unit.final_power * s.village.ally_defense_bonus
			unit.onAllyVillageBonus = true
		}

		check(unit.final_power, validNumber)
	})
}


Units.prototype._isOnAllyCastle = function(unit) {
	check(unit.user_id, String)
	
	var user = this.getUserOfUnit(unit)
	if (user) {
		check(user.allies_below, Array)
		if (user.allies_below.length > 0) {
			if (Castles.find({x: unit.x, y: unit.y, user_id: {$in: user.allies_below}}).count() > 0) {
				return true
			}
		}
	}

	return false
}


Units.prototype._isOnAllyVillage = function(unit) {
	check(unit.user_id, String)
	
	var user = this.getUserOfUnit(unit)
	if (user) {
		check(user.allies_below, Array)
		if (user.allies_below.length > 0) {
			if (Villages.find({x: unit.x, y: unit.y, user_id: {$in: user.allies_below}}).count() > 0) {
				return true
			}
		}
	}

	return false
}


Units.prototype._computeFinalPower = function() {
	var self = this
	_.each(self.allUnits, function(unit) {
		check(unit.basePower.total, validNumber)
		check(unit.bonus.total, validNumber)
		unit.final_power = unit.basePower.total + unit.bonus.total

		check(unit.final_power, validNumber)
	})
}


Units.prototype._computeBonus = function() {
	var self = this

	_.each(self.allUnits, function(unit) {
		var enemy_percentage = self._getEnemyPercentage(unit)

		// bonus
		unit.bonus = {}
		unit.bonus.footmen = 0
		unit.bonus.archers = unit.basePower.archers * unit.percentage.archers * enemy_percentage.footmen
		unit.bonus.pikemen = unit.basePower.pikemen * unit.percentage.pikemen * enemy_percentage.cavalry
		unit.bonus.cavalry = unit.basePower.cavalry * unit.percentage.cavalry * (enemy_percentage.archers + enemy_percentage.footmen)
		unit.bonus.catapults = 0

		// catapults
		var defender = self.getDefender()
		if (unit.isAttacker) {
			if (defender.type == 'castle' || defender.type == 'village') {
				unit.bonus.catapults = unit.basePower.catapults * s.army.stats.catapults.bonus_against_buildings
			}
		}

		// total bonus
		unit.bonus.total = 0
		_.each(s.army.types, function(type) {
			unit.bonus.total += unit.bonus[type]
		})
		check(unit.bonus.total, validNumber)
	})
}




Units.prototype._getEnemyPercentage = function(unit) {
	var self = this
	var enemies = self.getEnemies(unit)
	var percentage = {}

	var numUnits = self.getEnemyNumSoldiers(unit)

	_.each(s.army.types, function(type) {
		if (numUnits[type] == 0) {
			percentage[type] = 0
		} else {
			percentage[type] = numUnits[type] / numUnits.total
		}

		check(percentage[type], validNumber)
	})

	return percentage
}


Units.prototype._setArmyInfo = function() {
	var self = this

	_.each(self.allUnits, function(unit) {
		unit.basePower = {total:0}
		unit.numUnits = 0
		unit.percentage = {}

		if (unit.isAttacker) {
			_.each(s.army.types, function(type) {
				unit.basePower[type] = s.army.stats[type].offense * unit[type]
				unit.basePower.total += s.army.stats[type].offense * unit[type]
				unit.numUnits += unit[type]
			})
		} else {
			_.each(s.army.types, function(type) {
				unit.basePower[type] = s.army.stats[type].defense * unit[type]
				unit.basePower.total += s.army.stats[type].defense * unit[type]
				unit.numUnits += unit[type]
			})
		}

		check(unit.basePower.total, validNumber)
		check(unit.numUnits, validNumber)

		// percentage
		// for each unit, what percentage of the army are they
		_.each(s.army.types, function(type) {
			if (unit[type] == 0) {
				unit.percentage[type] = 0
			} else {
				unit.percentage[type] = unit[type] / unit.numUnits
			}

			check(unit.percentage[type], validNumber)
		})
	})
}


Units.prototype._findAttackersAndDefender = function() {
	var self = this
	var defenderFound = false

	// set everyone to be attacker
	_.each(self.allUnits, function(unit) {
		unit.isAttacker = true
	})

	// if there is a castle or a village then they are the defender
	var castle = self.getCastle()
	if (castle) {
		castle.isAttacker = false
		defenderFound = true
	}

	var village = self.getVillage()
	if (village) {
		village.isAttacker = false
		defenderFound = true
	}

	// if no castle or village then get the first army that arrived here
	if (!defenderFound) {
		var firstArmy = self._findArmyThatArrivedFirst()
		if (firstArmy) {
			firstArmy.isAttacker = false
		}
	}
}



Units.prototype._findArmyThatArrivedFirst = function() {
	var oldest_date = moment(new Date()).add(1, 'years')
	var firstArmy = null

	_.each(this.allUnits, function(unit) {
		if (unit.type == 'army') {
			if (unit.last_move_at) {
				var last_move_at = moment(new Date(unit.last_move_at))
			} else {
				var last_move_at = moment(new Date())
			}
			
			if (last_move_at.isBefore(oldest_date)) {
				oldest_date = last_move_at
				firstArmy = unit
			}
		}
	})

	return firstArmy
}


