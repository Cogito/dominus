getUnitBasePower = function(unit) {
	var power = {offense:{total:0}, defense:{total:0}}

	_.each(s.army.types, function(type) {
		power.offense[type] = s.army.stats[type].offense * unit[type]
		power.defense[type] = s.army.stats[type].defense * unit[type]

		power.offense.total += s.army.stats[type].offense * unit[type]
		power.defense.total += s.army.stats[type].defense * unit[type]
	})

	return power
}


getUnitLocationBonusMultiplier = function(unit, type) {
	check(unit, Object)
	check(type, String)

	var multiplier = 1

	switch (type) {
		case 'castle':
			multiplier = s.castle.defense_bonus
			break
		case 'village':
			multiplier = s.village.defense_bonus
			break;
		case 'army':
			if (isArmyOnAllyCastle(unit)) {
				multiplier = s.castle.ally_defense_bonus
			} else if (isArmyOnAllyVillage(unit)) {
				multiplier = s.village.ally_defense_bonus
			}
			break;
	}

	return multiplier
}


// castle must be in client db if called on client
isArmyOnAllyCastle = function(army) {
	var castle = Castles.findOne({x:army.x, y:army.y}, {fields: {user_id:1}})
	if (castle) {
		return isUnitMineOrAllyBelow(castle)
	}
	return false
}


// village must be in client db if called on client
isArmyOnAllyVillage = function(army) {
	var village = Villages.findOne({x:army.x, y:army.y}, {fields: {user_id:1}})
	if (village) {
		return isUnitMineOrAllyBelow(village)
	}
	return false
}


isUnitMineOrAllyBelow = function(unit) {
	check(unit.user_id, String)
	var user = Meteor.users.findOne(Meteor.userId(), {fields: {}})
	if (user) {
		if (unit.user_id == user._id) {
			return true
		}

		if (_.contains(user.allies_below, unit.user_id)) {
			return true
		}
	}
	return false
}