BattleDb = function(x,y, unitObj) {
	var self = this
	self.unitObj = unitObj

	// get battle here
	self.record = Battles.findOne({x:x, y:y})

	// if there is no battle here then create one
	if (self.record) {
		self.record.roundNumber++
	} else {
		self.record = {
			x:x,
			y:y,
			created_at:new Date(),
			updated_at:new Date(),
			roundNumber: 1,
			deaths: [],
			roundData: [],
			currentUnits: self.getCurrentUnits()
		}
		self.record._id = Battles.insert(self.record)

		// send new battle notification
		_.each(self.unitObj.getAllUnits(), function(unit) {
			self.record.unit = unit
			notification_battle_start(unit.user_id, self.record)
		})
	}
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
	this._trackLosses()
	Battles.remove(this.record._id)
}


BattleDb.prototype.saveRecord = function() {
	var self = this

	// var allUnits = []

	// _.each(self.unitObj.getAllUnits(), function(unit) {
	// 	if (self.unitObj.hasSoldiers(unit)) {
	// 		if (self.unitObj.hasEnemies(unit)) {
	// 			var cloned = cloneObject(unit)
	// 			cloned.allies = self.unitObj.getAllies(unit)
	// 			cloned.teamFinalPower = self.unitObj.getTeamFinalPower(unit)
	// 			cloned.teamBasePower = self.unitObj.getTeamBasePower(unit)
	// 			cloned.teamBonus = self.unitObj.getTeamBonus(unit)
	// 			cloned.teamNumSoldiers = self.unitObj.getTeamNumSoldiers(unit)
	// 			cloned.enemies = self.unitObj.getEnemies(unit)
	// 			cloned.enemyFinalPower = self.unitObj.getEnemyFinalPower(unit)
	// 			cloned.enemyBasePower = self.unitObj.getEnemyBasePower(unit)
	// 			cloned.enemyBonus = self.unitObj.getEnemyBonus(unit)
	// 			cloned.enemyNumSoldiers = self.unitObj.getEnemyNumSoldiers(unit)
	// 			cloned.castleDefenseBonus = unit.castleDefenseBonus
	// 			cloned.villageDefenseBonus = unit.villageDefenseBonus
	// 			cloned.onAllyCastleBonus = unit.onAllyCastleBonus
	// 			cloned.onAllyVillageBonus = unit.onAllyVillageBonus
	// 			allUnits.push(cloned)
	// 		}
	// 	}
	// })

	var roundData = {
		roundNumber: self.record.roundNumber,
		units: self.getCurrentUnits()
	}

	var set = {
		updated_at:new Date(),
		roundNumber: self.record.roundNumber,
		deaths: self.record.deaths,
		currentUnits: self.getCurrentUnits()
	}

	Battles.update(self.record._id, {$set: set, $addToSet: {roundData: roundData}})
}


BattleDb.prototype.getRecord = function() {
	return this.record
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