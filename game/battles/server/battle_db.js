BattleDb = function(x,y, unitObj, record) {
	this.unitObj = unitObj
	this.debug = false
	this.x = x
	this.y = y
	this.record = record
}


BattleDb.prototype.init = function() {
	var self = this

	self.record.currentUnits = self.getCurrentUnits()

	if (self.debug) {console.log('--- round '+self.record.roundNumber+' ---')}

	if (self.record.roundNumber == 1) {

		_.each(self.unitObj.getAllUnits(), function(unit) {
			self.unitObj.enteredBattle(unit)
		})
	}
}


BattleDb.prototype.hasStartAlertBeenSentTo = function(unit) {
	var self = this

	var foundRecord = _.find(self.record.sentStartAlertTo, function(u) {
		return u == unit._id
	})

	return foundRecord
}

// keep track of who we've sent battle started alert to
// so that we don't send twice
BattleDb.prototype.addToSentStartAlertTo = function(unit) {
	var self = this

	var foundRecord = _.find(self.record.sentStartAlertTo, function(u) {
		return u == unit._id
	})

	if (!foundRecord) {
		self.record.sentStartAlertTo.push(unit._id)
		if (self.debug) {console.log(unit.username+':'+unit.name+':'+unit.type+' added to sentStartAlertTo list')}
	}
}


BattleDb.prototype.getCurrentUnits = function() {
	var self = this

	var allUnits = []

	_.each(self.unitObj.getAllUnits(), function(unit) {
//		if (self.unitObj.hasSoldiers(unit)) {
//			if (self.unitObj.hasEnemies(unit)) {
				var cloned = cloneObject(unit)
				cloned.allies = self.unitObj.getAllies(unit)
				cloned.teamFinalPower = self.unitObj.getTeamFinalPower(unit)
				cloned.teamBasePower = self.unitObj.getTeamBasePower(unit)
				cloned.teamBonus = self.unitObj.getTeamBonus(unit)
				cloned.teamNumSoldiers = self.unitObj.getTeamNumSoldiers(unit)
				cloned.enemies = self.unitObj.getEnemies(unit)
				cloned.enemyFinalPower = self.unitObj.getEnemyFinalPower(unit)
				cloned.enemyBasePower = self.unitObj.getEnemyBasePower(unit)
				cloned.enemyBonus = self.unitObj.getEnemyBonus(unit)
				cloned.enemyNumSoldiers = self.unitObj.getEnemyNumSoldiers(unit)
				cloned.castleDefenseBonus = unit.castleDefenseBonus
				cloned.villageDefenseBonus = unit.villageDefenseBonus
				cloned.onAllyCastleBonus = unit.onAllyCastleBonus
				cloned.onAllyVillageBonus = unit.onAllyVillageBonus
				allUnits.push(cloned)
//			}
//		}
	})

	return allUnits
}



BattleDb.prototype.endBattle = function() {
	if (this.debug) {console.log('db endBattle called')}
	this._trackLosses()
	Battles.update(this.record._id, {$set: {isOver:true}})
	this.record.isOver = true
}


BattleDb.prototype.saveRecord = function() {
	var self = this

	var currentUnits = self.getCurrentUnits()

	// if there is not a castle in the fight
	// check if there is a castle in the hex
	// if so add it so that it's listed in the report
	var castle = self.unitObj.getCastle()
	if (!castle) {
		var castle_fields = {name:1, user_id:1, x:1, y:1, username:1, image:1}
		var castle = Castles.findOne({x:self.x, y:self.y}, {fields: castle_fields})
		if (castle) {
			castle.type = 'castle'
			currentUnits.push(castle)
		}
	}

	var roundData = {
		roundNumber: self.record.roundNumber,
		units: self.getCurrentUnits(),
		battle_id:self.record._id,
		created_at: new Date(),
	}

	var set = {
		updated_at:new Date(),
		roundNumber: self.record.roundNumber,
		deaths: self.record.deaths,
		currentUnits: currentUnits,
		sentStartAlertTo: self.record.sentStartAlertTo,
		castleWasTaken: self.record.castleWasTaken,
		castle_id: self.record.castle_id,
		castleTakenByArmy_id: self.record.castleTakenByArmy_id
	}

	Fights.insert(roundData)
	Battles.update(self.record._id, {$set: set})
}


BattleDb.prototype.saveAfterCastleTaken = function() {
	var self = this
	var set = {
		castleWasTaken: self.record.castleWasTaken,
		castle_id: self.record.castle_id,
		castleTakenByArmy_id: self.record.castleTakenByArmy_id
	}
	Battles.update(self.record._id, {$set: set})
}


BattleDb.prototype.getRecord = function() {
	return cloneObject(this.record)
}


BattleDb.prototype.addToLosses = function(unit, armyType, numDead, power) {
	var self = this
	check(unit, Object)
	check(armyType, String)
	check(numDead, validNumber)

	// is unit already in deaths array
	var existsInDeaths = _.find(self.record.deaths, function(d) {
		if (d.user_id == unit.user_id && d.name == unit.name) {
			return true
		} else {
			return false
		}
	})

	if (existsInDeaths) {
		// already in deaths array
		self.record.deaths = _.reject(self.record.deaths, function(d) {
			if (d.user_id == unit.user_id && d.name == unit.name) {
				return true
			} else {
				return false
			}
		})

		existsInDeaths[armyType] += numDead
		existsInDeaths.power += power
		existsInDeaths.total += numDead

		self.record.deaths.push(existsInDeaths)

	} else {
		var u = {
			_id: unit._id,
			user_id: unit.user_id,
			username: unit.username,
			name: unit.name,
			type: unit.type,
			x: unit.x,
			y: unit.y,
			power: power,
			total: numDead
		}

		_.each(s.army.types, function(type) {
			u[type] = 0
		})

		u[armyType] = numDead

		self.record.deaths.push(u)
	}
}


// keep track of losses for top 10 users by lost soldiers
BattleDb.prototype._trackLosses =  function() {
	var self = this

	_.each(self.record.deaths, function(deathRecord) {

		var soldiersLost = {}

		_.each(s.army.types, function(type) {
			if (deathRecord[type] && deathRecord[type] > 0) {
				soldiersLost[type] = deathRecord[type]
			}
		})

		var inc = {}
		_.each(soldiersLost, function(value, key) {
			inc["losses."+key] = value
		})

		var user = Meteor.users.findOne(deathRecord.user_id, {losses:1})
		if (user) {
			if (user.losses) {
				Meteor.users.update(user._id, {$inc: inc})
			} else {
				Meteor.users.update(user._id, {$set: inc})
			}

			Cue.addTask('update_losses_worth',{isAsync:true, unique:true}, {user_id: user._id})
		}
	})
}
