// TODO: if an army attacks a village and the village has 0 units the army will still lose units.
// losses should be capped at the number of units in the enemy armies

// TODO: roundNumber does not get incrmented the round that the battle ends.
// If an army attacks a village with 0 units then it says 0 rounds in the notification.

// TODO: notifications are sometimes missing data.  I think it's because they're called after save.
// save removes dead units so the notification can't send info about them
// if that's why then maybe prepareDataForNotification should be called before save
// but sendNotification should still be called in the same place it is now

// need to update networth every round

// how is draco my vassal

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

		var battle = new Fight(x,y)
		battle.init()

		// gather info, compute power
		battle.findDefender()

		if (battle.defender) {
			battle.findAttackers()
			battle.getUsers()

			_.each(battle.allUnits, function(u) {
				battle.setArmyInfo(u)
			})

			_.each(battle.allUnits, function(u) {
				battle.findEnemies(u)
			})

			_.each(battle.allUnits, function(u) {
				battle.getEnemyInfo(u)
			})

			_.each(battle.allUnits, function(u) {
				battle.computeBonus(u)
			})

			_.each(battle.allUnits, function(u) {
				battle.computeFinalPower(u)
			})

			battle.setLocationBonus()

			

			// all info gathered, do battle!
			_.each(battle.allUnits, function(u) {
				battle.fight(u)
			})

			_.each(battle.allUnits, function(u) {
				u.survivors = battle.findSurvivors(u)
			})

			// save
			_.each(battle.allUnits, function(u) {
				battle.save(u)
			})

			battle.isBattleOver()
			battle.endBattle()
		} else {
			battle.isOver = true
			battle.endBattle()
		}

		
	}
}




Fight = function(x, y) {
	this.x = x
	this.y = y


	this.init = function() {

		// get battle here
		this.battle = Battles.findOne({x:x, y:y})

		// if there is no battle here then create one
		if (!this.battle) {
			this.battle = {
				x:x,
				y:y,
				created_at:new Date(),
				updated_at:new Date(),
				roundNumber: 0,
				deaths: []
			}
			this.battle._id = Battles.insert(this.battle)
		}

		this.isOver = false
		this.numPartiesInBattle = 0	// used to tell if battle is over
		this.allUnits = []	// array of both attackers and defenders

		var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
		var army_fields = {name:1, user_id:1, x:1, y:1, last_move_at:1, username:1, castle_x:1, castle_y:1, castle_id:1}
		var village_fields = {name:1, user_id:1, x:1, y:1, username:1, castle_x:1, castle_y:1, castle_id:1}

		_.each(s.army.types, function(type) {
			castle_fields[type] = 1
			army_fields[type] = 1
			village_fields[type] = 1
		})

		this.armies = Armies.find({x:x, y:y}, {fields: army_fields})
		this.castle = Castles.findOne({x:x, y:y}, {fields: castle_fields})
		this.village = Villages.findOne({x:x, y:y}, {fields: village_fields})
	}



	// there is always one defender
	// if there is a castle or village then they are the defender
	// otherwise it's the army who arrived first and is still alive
	this.findDefender = function() {
		var self = this
		var defenderFound = false

		if (self.castle) {
			var hasUnits = false
			_.each(s.army.types, function(type) {
				if (self.castle[type] > 0) {
					hasUnits = true
				}
			})

			if (hasUnits) {
				self.defender = self.castle
				self.defender.type = 'castle'
				defenderFound = true
			}
		}

		if (self.village && !defenderFound) {
			// villages should be in the battle even if they have no defenders
			// this way they vill be destroyed when they lose all solders
			self.defender = self.village
			self.defender.type = 'village'
			defenderFound = true
		}

		if (!defenderFound) {
			var def = self.findArmyThatArrivedFirst()
			if (def) {
				self.defender = self.findArmyThatArrivedFirst()
				this.defender.type = 'army'
			}
		}

		if (self.defender) {
			self.defender.isAttacker = false
			self.numPartiesInBattle++
			self.allUnits.push(self.defender)
		}
	}

	// used in findDefender
	this.findArmyThatArrivedFirst = function() {
		var oldest_date = moment(new Date()).add(1, 'years')
		var firstArmy = null

		this.armies.forEach(function(army) {
			var last_move_at = moment(new Date(army.last_move_at))
			if (last_move_at.isBefore(oldest_date)) {
				oldest_date = last_move_at
				firstArmy = army
			}
		})

		return firstArmy
	}



	// everyone who is not a defender is an attacker
	// findDefender must be called before findAttackers
	this.findAttackers = function() {
		var self = this
		if (self.defender) {
			check(self.defender._id, String)
			self.attackers = []
			self.armies.forEach(function(army) {
				if (army._id != self.defender._id) {
					army.type = 'army'
					army.isAttacker = true
					self.attackers.push(army)
					self.allUnits.push(army)
					self.numPartiesInBattle++
				}
			})
		}
	}


	// get user info for later
	// this is needed in isEnemy
	this.getUsers = function() {
		var self = this

		_.each(self.allUnits, function(u) {
			u.user = Meteor.users.findOne(u.user_id, {fields: {allies:1, team:1, allies_below:1, allies_above:1}})
		})
	}



	// loop through all units and find if they're an enemy
	this.findEnemies = function(unit) {
		check(unit, Object)
		var self = this
		unit.enemies = []

		if (self.defender._id != unit._id) {
			if (self.isEnemy(unit, self.defender)) {
				unit.enemies.push(self.getDataForEnemy(self.defender))
			}
		}

		_.each(self.attackers, function(attacker) {
			if (attacker._id != unit._id) {
				if (self.isEnemy(unit, attacker)) {
					unit.enemies.push(self.getDataForEnemy(attacker))
				}
			}
		})
	}


	// this is to stop unit.enemies from being a reference and creating a loop
	this.getDataForEnemy = function(unit) {
		var data = {
			_id: unit._id,
			username: unit.username,
			type: unit.type,
			x: unit.x,
			y: unit.y,
			castle_id: unit.castle_id,
			user_id: unit.user_id
		}

		_.each(s.army.types, function(type) {
			data[type] = unit[type]
		})

		return data
	}


	// get enemies of unit
	// unit contains .enemies which is an array of _ids
	// search through units and return ones in .enemies
	this.getEnemies = function(unit) {
		var enemies = []
		var self = this

		if (unit.enemies) {
			_.each(self.allUnits, function(u) {
				if (u._id != unit._id) {
					var e = _.pluck(unit.enemies, '_id')
					if (_.indexOf(e, u._id) != -1) {
						enemies.push(u)
					}
				}
			})
		}

		return enemies
	}



	// figure out if they're an enemy based on their relationship to unit
	this.isEnemy = function(unit, otherUnit) {
		check(unit, Object)
		check(unit.user, Object)
		check(otherUnit, Object)

		if (unit.user_id == otherUnit.user_id) {
			return false
		}

		var isEnemy = false

		switch (unit.type) {
			case 'castle':
				if (_.indexOf(unit.user.allies_above, otherUnit.user_id) == -1) {
					isEnemy = true
				}
				break

			case 'village':
			case 'army':
				if (otherUnit.type == 'castle') {
					if (_.indexOf(unit.user.team, otherUnit.user_id) == -1) {
						isEnemy = true
					} else {
						if (_.indexOf(unit.user.allies_below, otherUnit.user_id) == -1) {
							isEnemy = true
						}
					}
				} else {
					if (_.indexOf(unit.user.allies, otherUnit.user_id) == -1) {
						isEnemy = true
					}
				}
				break
		}

		return isEnemy
	}



	this.setArmyInfo = function(unit) {
		unit.base_power = {total:0}
		unit.num_units = 0

		if (unit.isAttacker) {
			_.each(s.army.types, function(type) {
				unit.base_power[type] = s.army.stats[type].offense * unit[type]
				unit.base_power.total += s.army.stats[type].offense * unit[type]
				unit.num_units += unit[type]
			})
		} else {
			_.each(s.army.types, function(type) {
				unit.base_power[type] = s.army.stats[type].defense * unit[type]
				unit.base_power.total += s.army.stats[type].defense * unit[type]
				unit.num_units += unit[type]
			})
		}

		check(unit.base_power.total, validNumber)

		// percentage
		// for each unit, what percentage of the army are they
		unit.percentage = {}
		_.each(s.army.types, function(type) {
			if (unit[type] == 0) {
				unit.percentage[type] = 0
			} else {
				unit.percentage[type] = unit[type] / unit.num_units
			}
			check(unit.percentage[type], validNumber)
		})

	}



	// loop through enemies and gather power and number of units
	this.getEnemyInfo = function(unit) {
		var self = this

		unit.enemy_base_power = {total:0}
		unit.enemy_num_units = {total:0}
		unit.enemy_bonus = {total:0}
		_.each(s.army.types, function(type) {
			unit.enemy_num_units[type] = 0
			unit.enemy_base_power[type] = 0
			unit.enemy_bonus[type] = 0
		})

		_.each(self.getEnemies(unit), function(enemy) {

			var enemyPercentage = {}
			var enemyBasePower = {total:0}
			var enemyNumUnits = {total:0}
			var enemyBonus = {total:0}

			// base power and number of soldiers
			_.each(s.army.types, function(type) {
				if (enemy.isAttacker) {
					enemyBasePower[type] = s.army.stats[type].offense * enemy[type] 
					enemyBasePower.total += s.army.stats[type].offense * enemy[type]
					enemyNumUnits[type] = enemy[type]
					enemyNumUnits.total += enemy[type]
				} else {
					enemyBasePower[type] = s.army.stats[type].defense * enemy[type] 
					enemyBasePower.total += s.army.stats[type].defense * enemy[type] 
					enemyNumUnits[type] = enemy[type]
					enemyNumUnits.total += enemy[type]
				}
				
			})

			// percentage, needed for bonus
			_.each(s.army.types, function(type) {
				if (enemyNumUnits[type] == 0) {
					enemyPercentage[type] = 0
				} else {
					enemyPercentage[type] = enemyNumUnits[type] / enemyNumUnits.total
				}
				check(enemyPercentage[type], validNumber)
			})

			// bonuses
			enemyBonus.footmen = 0
			enemyBonus.archers = enemyBasePower.archers * enemyPercentage.archers * unit.percentage.footmen
			enemyBonus.pikemen = enemyBasePower.pikemen * enemyPercentage.pikemen * unit.percentage.cavalry
			enemyBonus.cavalry = enemyBasePower.cavalry * enemyPercentage.cavalry * (unit.percentage.archers + unit.percentage.footmen)
			enemyBonus.catapults = 0

			// catapult bonus
			if (unit.type == 'castle' || unit.type == 'village') {
				if (enemyNumUnits.catapults > 0) {
					enemyBonus.catapults = enemyNumUnits.catapults * s.army.stats.catapults.bonus_against_buildings
				}
			}

			// total bonus
			_.each(s.army.types, function(type) {
				enemyBonus.total += enemyBonus[type]
			})

			// final power
			var enemyFinalPower = enemyBasePower.total + enemyBonus.total

			// location bonus
			if (enemy.type == 'castle') {
				enemyFinalPower = enemyFinalPower * s.castle.defense_bonus
			}

			if (enemy.type == 'village') {
				enemyFinalPower = enemyFinalPower * s.village.defense_bonus
			}

			// bonus for being on allied castle or village
			if (self.isOnAllyCastle(enemy)) {
				enemyFinalPower = enemyFinalPower * s.castle.ally_defense_bonus
			}

			if (self.isOnAllyCastle(enemy)) {
				enemyFinalPower = enemyFinalPower * s.village.ally_defense_bonus
			}

			// add to unit
			_.each(s.army.types, function(type) {
				unit.enemy_base_power[type] += enemyBasePower[type]
				unit.enemy_base_power.total += enemyBasePower[type]
				unit.enemy_num_units[type] += enemyNumUnits[type]
				unit.enemy_num_units.total += enemyNumUnits[type]
				unit.enemy_bonus[type] += enemyBonus[type]
				unit.enemy_bonus.total += enemyBonus[type]
				unit.enemy_final_power = enemyFinalPower
			})
		})


		// percentage
		unit.enemy_percentage = {}
		_.each(s.army.types, function(type) {
			if (unit.enemy_num_units[type] == 0) {
				unit.enemy_percentage[type] = 0
			} else {
				unit.enemy_percentage[type] = unit.enemy_num_units[type] / unit.enemy_num_units.total
			}
			check(unit.enemy_percentage[type], validNumber)
		})
	}




	this.computeBonus = function(unit) {
		var self = this

		// my bonus
		unit.bonus = {}
		unit.bonus.footmen = 0
		unit.bonus.archers = unit.base_power.archers * unit.percentage.archers * unit.enemy_percentage.footmen
		unit.bonus.pikemen = unit.base_power.pikemen * unit.percentage.pikemen * unit.enemy_percentage.cavalry
		unit.bonus.cavalry = unit.base_power.cavalry * unit.percentage.cavalry * (unit.enemy_percentage.archers + unit.enemy_percentage.footmen)
		unit.bonus.catapults = 0

		// my catapults
		if (unit.isAttacker) {
			if (self.defender.type == 'castle' || self.defender.type == 'village') {
				unit.bonus.catapults = unit.base_power.catapults * s.army.stats.catapults.bonus_against_buildings
			}
		}

		// my total bonus
		unit.bonus.total = 0
		_.each(s.army.types, function(type) {
			unit.bonus.total += unit.bonus[type]
		})
		check(unit.bonus.total, validNumber)
	}



	// power + bonus
	this.computeFinalPower = function(unit) {
		unit.final_power = unit.base_power.total + unit.bonus.total
	}



	// bonus for being inside a castle/village or on allied castle/village
	this.setLocationBonus = function() {
		var self = this

		if (self.defender.type == 'castle') {
			self.defender.final_power = self.defender.final_power * s.castle.defense_bonus
			check(self.defender.final_power, validNumber)
		}

		if (self.defender.type == 'village') {
			self.defender.final_power = self.defender.final_power * s.village.defense_bonus
			check(self.defender.final_power, validNumber)
		}

		_.each(self.allUnits, function(u) {
			if (self.isOnAllyCastle(u)) {
				u.final_power = u.final_power * s.castle.ally_defense_bonus
			}

			if (self.isOnAllyCastle(u)) {
				u.final_power = u.final_power * s.village.ally_defense_bonus
			}
		})
	}


	this.isOnAllyCastle = function(unit) {
		check(unit.user_id, String)
		var user = Meteor.users.findOne(unit.user_id, {fields: {allies_below:1}})
		if (user) {
			check(user.allies_below, Array)
			if (user.allies_below.length > 0) {
				if (Castles.find({x: unit.x, y: unit.y, user_id: {$in: user.allies_below}}).count() > 0) {
					return true
				}
			}
		}
	}


	this.isOnAllyVillage = function(unit) {
		check(unit.user_id, String)
		var user = Meteor.users.findOne(unit.user_id, {fields: {allies: 1}})
		if (user) {
			check(user.allies, Array)
			if (user.allies.length > 0) {
				if (Villages.find({x: unit.x, y: unit.y, user_id: {$in: user.allies}}).count() > 0) {
					return true
				}
			}
		}
	}



	// find who won
	this.fight = function(unit) {
		unit.dif = unit.final_power - unit.enemy_final_power
		check(unit.dif, validNumber)
	}
	


	this.numDead = function(dif, numPartiesInBattle, numEnemySoldiers) {
		if (numPartiesInBattle == 1) {
			var num_dead = 0

		} else if (dif > 0) {
			var percentageOfEnemyUnits = Math.floor(numEnemySoldiers * s.battle_dead_per_round_win_percentage)
			var percentageOfLoserLosses = Math.floor(s.battle_dead_per_round_lose * s.battle_dead_per_round_win_percentage)
			
			var num_dead = Math.min(percentageOfEnemyUnits, percentageOfLoserLosses)

		} else {
			var num_dead = s.battle_dead_per_round_lose
		}

		return num_dead
	}


	// pick who died randomly
	this.findSurvivors = function(unit) {
		var self = this
		var survivors = {}

		var numEnemySoldiers = 0

		// get number of enemy soldiers
		_.each(self.getEnemies(unit), function(e) {
			_.each(s.army.types, function(type) {
				numEnemySoldiers += e[type]
			})
		})

		// set survivors to unit's current soldiers
		_.each(s.army.types, function(type) {
			survivors[type] = unit[type]
		})

		var num_dead = self.numDead(unit.dif, self.numPartiesInBattle, numEnemySoldiers)

		// loop, take away at random until all dead are taken
		var i = 0
		var units_left = unit.num_units
		while (i < num_dead) {
			var rand = Math.floor(Math.random() * s.army.types.length)
			var type = s.army.types[rand]
			check(survivors[type], validNumber)

			if (survivors[type] > 0) {
				survivors[type]--
				self.addToDead(unit, type, 1)
				i++
				units_left--
			}

			// stop if everyone is dead
			if (units_left == 0) {
				i = num_dead
			}
		}

		// total survivors
		survivors.total = 0
		_.each(s.army.types, function(type) {
			survivors.total += survivors[type]
		})

		return survivors
	}


	// keep track of losses
	this.addToDead = function(unit, armyType, numDead) {
		var self = this

		if (!self.battle.deaths) {
			self.battle.deaths = []
		}

		// is unit already in deaths array
		var existsInDeaths = _.find(self.battle.deaths, function(d) {
			return d.user_id == unit.user_id
		})

		if (existsInDeaths) {
			// already in deaths array
			self.battle.deaths = _.reject(self.battle.deaths, function(d) {
				return d.user_id == unit.user_id
			})

			existsInDeaths[armyType] += numDead

			self.battle.deaths.push(existsInDeaths)
		} else {
			var u = {
				_id: unit._id,
				user_id: unit.user_id,
				username: unit.username,
				name: unit.name,
				type: unit.type,
				x: unit.x,
				y: unit.y
			}

			_.each(s.army.types, function(type) {
				u[type] = 0
			})

			u[armyType] = numDead

			self.battle.deaths.push(u)
		}
	}



	

	// used in save() to find who to give castle to
	// must be called after findSurvivors()
	// should only be called if defender is a castle
	this.findWhoGetsCastle = function() {
		var self = this
		check(this.castle, Object)

		this.castle.user = Meteor.users.findOne(this.castle.user_id, {fields: {allies:1, team:1, allies_below:1, allies_above:1}})

		var oldest_date = moment(new Date()).add(1, 'years')
		var firstArmy = null

		// if castle is empty and there is only one party here then they get the castle
		if (self.defender.type != 'castle' && self.numPartiesInBattle == 1 && self.defender.survivors.total > 0) {
			return self.defender
		}

		self.castle.type = 'castle'

		if (self.defender.type != 'castle') {
			if (self.defender.survivors.total > 0) {
				if (self.isEnemy(self.castle, self.defender)) {
					var last_move_at = new Date(self.defender.last_move_at)
					if (last_move_at < oldest_date) {
						oldest_date = last_move_at
						firstArmy = self.defender
					}
				}
			}
		}

		_.each(self.attackers, function(army) {
			check(army.survivors.total, validNumber)
			if (army.survivors.total > 0) {
				if (self.isEnemy(self.castle, army)) {
					var last_move_at = new Date(army.last_move_at)
					if (last_move_at < oldest_date) {
						oldest_date = last_move_at
						firstArmy = army
					}
				}
			}
		})

		if (firstArmy) {
			return firstArmy
		} else {
			return false
		}
	}


	// save to db
	// destroy unit if they have no survivors
	this.save = function(unit) {
		var self = this

		var set = {}
		_.each(s.army.types, function(type) {
			set[type] = unit.survivors[type]
		})

		switch (unit.type) {
			case 'army':
				if (unit.survivors.total > 0) {
					// remove dead from army
					Armies.update(unit._id, {$set: set})
				} else {
					// army is destroyed
					self.sendNotification(unit.user_id, self)
					Armies.remove(unit._id)
					self.numPartiesInBattle--
				}
				break

			case 'village':
				if (unit.survivors.total > 0) {
					// remove dead
					Villages.update(unit._id, {$set: set})
				} else {
					// destroy village
					self.sendNotification(unit.user_id, self)
					Villages.remove(unit._id)
					self.numPartiesInBattle--
				}
				break

			case 'castle':
				Castles.update(unit._id, {$set: set})
				if (unit.survivors.total == 0) {
					self.sendNotification(unit.user_id, self)
					self.numPartiesInBattle--
				}
				break
		}
	}



	// find if this is the last round in the battle
	// if no units have enemies then end it
	this.isBattleOver = function() {
		var self = this
		var someoneHasAnEnemy = false 	// if someone has an enemy then battle is not over
		var peopleStillAlive = []	// who should we send a notification to if battle is over

		// check if defender is still alive and their enemies are still alive
		// if (self.defender.survivors.total > 0) {
		// 	peopleStillAlive.push(self.defender)
		// 	_.each(self.getEnemies(self.defender), function(enemy) {
		// 		if (enemy.survivors.total > 0) {
		// 			someoneHasAnEnemy = true
		// 		}
		// 	})
		// }

		// check if anyone is still alive and their enemies are still alive
		_.each(self.allUnits, function(u) {
			if (u.survivors.total > 0) {
				peopleStillAlive.push(u)
				_.each(self.getEnemies(u), function(enemy) {
					if (enemy.survivors.total > 0) {
						someoneHasAnEnemy = true
					}
				})
			}
		})

		if (!someoneHasAnEnemy) {
			self.isOver = true

			// if there is a castle here
			// check if someone should get the casle
			if (self.castle) {
				var winner = self.findWhoGetsCastle()
				if (winner) {
					var lord = Meteor.users.findOne(winner.user_id)
					var vassal = Meteor.users.findOne(self.castle.user_id)
					if (lord && vassal) {
						set_lord_and_vassal(lord, vassal, true)
					} else {
						console.log(lord)
						console.log(vassal)
						throw new Meteor.Error(404, "couldn't find lord and vassal");
					}
				}
			}


			// send notification to surviving people
			_.each(peopleStillAlive, function(u) {
				self.sendNotification(u.user_id, self)
			})
		}
	}



	// is the battle over
	this.endBattle = function() {
		if (this.isOver) {
			Battles.remove(this.battle._id)
		} else {

			var set = {
				updated_at: new Date(),
				numPartiesInBattle: this.numPartiesInBattle,
				defender: limitObjectDepth(this.defender, 4),
				attackers: limitObjectDepth(this.attackers, 5),
				deaths: this.battle.deaths
			}

			var inc = {
				roundNumber:1
			}

			Battles.update(this.battle._id, {$set: set, $inc: inc})
		}
	}


	// called in isBattleOver
	this.sendNotification = function(user_id) {
		check(user_id, String)
		var self = this
		var data = prepareDataForNotification(self)
		notification_battle(user_id, data)
		self.trackLosses(user_id, self)
	}


	this.trackLosses = function(user_id) {
		var self = this

		check(user_id, String)

		var user = Meteor.users.findOne(user_id)
		if (!user) {
			return false
		}

		// get how many units you lost
		var d = _.find(self.battle.deaths, function(deaths) {
			return deaths.user_id == user_id
		})

		if (d) {
			var losses = {}

			_.each(s.army.types, function(type) {
				if (d[type] && d[type] > 0) {
					losses[type] = d[type]
				}
			})

			var inc = {}
			_.each(losses, function(value, key) {
				inc["losses."+key] = value
			})

			if (!user.losses) {
				Meteor.users.update(user_id, {$set: inc})
			} else {
				Meteor.users.update(user_id, {$inc: inc})
			}

			worker.enqueue('update_losses_worth', {user_id: user_id})
		}
	}
}

function prepareDataForNotification(self) {
	var def = clone_object(self.defender)
	var att = clone_object(self.attackers)

	def.enemies = limitObjectDepth(self.getEnemies(def), 3)

	_.each(att, function(attacker) {
		attacker.enemies = limitObjectDepth(self.getEnemies(attacker), 3)
	})

	var data = {
		created_at: new Date(),
		battle: self.battle,
		isOver: self.isOver,
		roundNumber: self.battle.roundNumber,
		numPartiesInBattle: self.numPartiesInBattle,
		defender: def,
		attackers: att,
		deaths: self.battle.deaths
	}

	return data
}



limitObjectDepth = function(input, maxDepth) {

	function recursion(input, level) {

		if (level > maxDepth) {
			return null
		} else {

			if (_.isArray(input)) {
				var arr = []
				_.each(input, function(col) {
					arr.push(recursion(col, level+1))
				})
				return arr

			} else if (_.isObject(input)) {
				var obj = {}
				_.each(input, function(value, key) {
					obj[key] = recursion(value, level+1)
				})
				return obj

			} else {
				return input
			}

		}
	}

	return recursion(input, 1)
}