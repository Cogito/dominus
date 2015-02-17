BattleDb = function(x,y, unitObj) {
	this.unitObj = unitObj
	this.debug = false
	this.x = x
	this.y = y
}


BattleDb.prototype.init = function() {
	var self = this

	// get battle here
	self.record = Battles.findOne({x:self.x, y:self.y, isOver:false})

	// if there is no battle here then create one
	if (self.record) {
		self.record.roundNumber++
		if (self.debug) {console.log('--- round '+self.record.roundNumber+' ---')}
	} else {
		if (self.debug) {console.log('--- round 1 ---')}

		self.record = {
			x:self.x,
			y:self.y,
			created_at:new Date(),
			updated_at:new Date(),
			roundNumber: 1,
			deaths: [],
			//roundData: [],
			currentUnits: self.getCurrentUnits(),
			sendEndNotificationTo: [],	// set in enteredBattle - used for end battle notifications, no longer used
			isOver: false,
			sentStartAlertTo: []
		}
		self.record._id = Battles.insert(self.record)

		_.each(self.unitObj.getAllUnits(), function(unit) {
			self.addToSendEndNotificationTo(unit)
		})

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


// no longer used
// list of who to send end battle notifications to
// add unit to list if not already in it
BattleDb.prototype.addToSendEndNotificationTo = function(unit) {
	var self = this

	var foundRecord = _.find(self.getSendEndNotificationTo(), function(u) {
		return u._id == unit._id
	})

	if (!foundRecord) {
		self.record.sendEndNotificationTo.push(unit)
		if (self.debug) {console.log(unit.username+':'+unit.name+':'+unit.type+' added to sendEndNotificationTo list')}
	}
}


// no longer used
BattleDb.prototype.getSendEndNotificationTo = function() {
	return this.record.sendEndNotificationTo
}


BattleDb.prototype.removeFromSendEndNotificationTo = function(unit) {
	var self = this
	if (self.debug) {console.log(unit.username+':'+unit.name+':'+unit.type+' removed from sendEndNotificationTo list')}
	self.record.sendEndNotificationTo = _.reject(self.record.sendEndNotificationTo, function(u) {
		if (unit._id == u._id) {
			return true
		}
		return false
	})
}


BattleDb.prototype.getCurrentUnits = function() {
	var self = this

	var allUnits = []

	_.each(self.unitObj.getAllUnits(), function(unit) {
		if (self.unitObj.hasSoldiers(unit)) {
			if (self.unitObj.hasEnemies(unit)) {
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
			}
		}
	})

	return allUnits
}



BattleDb.prototype.endBattle = function() {
	if (this.debug) {console.log('endBattle called')}
	this._trackLosses()
	//Battles.remove(this.record._id)
	Battles.update(this.record._id, {$set: {isOver:true}})
}


BattleDb.prototype.saveRecord = function() {
	var self = this

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
		currentUnits: self.getCurrentUnits(),
		sendEndNotificationTo: self.record.sendEndNotificationTo,
		sentStartAlertTo: self.record.sentStartAlertTo
	}

	//Battles.update(self.record._id, {$set: set, $addToSet: {roundData: roundData}})
	Fights.insert(roundData)
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

			worker.enqueue('update_losses_worth', {user_id: user._id})
		}
	})
}
