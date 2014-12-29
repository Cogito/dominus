// takes return value of getUnitRelationType and return a nice string
getNiceRelationType = function(relationType) {
	switch(relationType) {
		case 'mine':
			return 'mine'
		case 'king':
			return 'king'
		case 'direct_lord':
			return 'lord'
		case 'lord':
			return 'lord'
		case 'vassal':
			return 'vassal'
		case 'direct_vassal':
			return 'vassal'
		case 'enemy_ally':
			return 'enemy with same king'
		case 'enemy':
			return 'enemy'
	}
}

// TODO: there are a few places that need to be updated to use this function
getUnitRelationType = function(user_id) {
	if (user_id) {
		var fields = {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1}
		var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
		if (user) {
			if (user_id == user._id) {
				return 'mine'
			} else if (_.indexOf(user.team, user_id) != -1) {

				if (_.indexOf(user.allies_above, user_id) != -1) {
					if (user_id == user.king) {
						return 'king'
					} else if (user_id == user.lord) {
						return 'direct_lord'
					} else {
						return 'lord'
					}
				} else if (_.indexOf(user.allies_below, user_id) != -1) {

					if (_.indexOf(user.vassals, user_id) != -1) {
						return 'direct_vassal'
					} else {
						return 'vassal'
					}

					// } else if (_.indexOf(user.siblings, user_id) != -1) {
					// 	return 'sibling'

				} else {
					return 'enemy_ally'
				}

			} else {
				return 'enemy'
			}
		}
	}
	return null
}


// server only, get otherUser's relationship to user
if (Meteor.isServer) {
	getPlayersRelationType_server = function(user_id, otherUser_id) {
		check(user_id, String)
		check(otherUser_id, String)

		var fields = {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1}
		var user = Meteor.users.findOne(user_id, {fields: fields})
		if (user) {
			if (otherUser_id == user._id) {
				return 'mine'
			} else if (_.indexOf(user.team, otherUser_id) != -1) {

				if (_.indexOf(user.allies_above, otherUser_id) != -1) {
					if (otherUser_id == user.king) {
						return 'king'
					} else if (otherUser_id == user.lord) {
						return 'direct_lord'
					} else {
						return 'lord'
					}
				} else if (_.indexOf(user.allies_below, otherUser_id) != -1) {

					if (_.indexOf(user.vassals, otherUser_id) != -1) {
						return 'direct_vassal'
					} else {
						return 'vassal'
					}

					// } else if (_.indexOf(user.siblings, user_id) != -1) {
					// 	return 'sibling'

				} else {
					return 'enemy_ally'
				}

			} else {
				return 'enemy'
			}
		}
	}
}

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
	check(army.user_id, String)
	var castle = Castles.findOne({x:army.x, y:army.y}, {fields: {user_id:1}})
	if (castle) {
		return isUnitMineOrAllyBelow(castle, army.user_id)
	}
	return false
}


// village must be in client db if called on client
isArmyOnAllyVillage = function(army) {
	check(army.user_id, String)
	var village = Villages.findOne({x:army.x, y:army.y}, {fields: {user_id:1}})
	if (village) {
		return isUnitMineOrAllyBelow(village, army.user_id)
	}
	return false
}


// is unit user_id's or their vassal
isUnitMineOrAllyBelow = function(unit, user_id) {
	check(unit.user_id, String)
	check(user_id, String)
	var user = Meteor.users.findOne(user_id, {fields: {allies_below:1}})
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
