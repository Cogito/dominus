// both client and server
s = {}
s.market = {}
s.resource = {}
s.army = {}
s.village = {}
s.castle = {}

if (Meteor.isServer && process.env.NODE_ENV == 'development') {
	// cheats
	s.resource.interval = 1000 * 15 * 1
	s.battle_interval = 1000 * 30
} else {
	s.resource.interval = 1000 * 60 * 10
	s.battle_interval = 1000 * 60 * 5
}

s.hex_size = 60
s.hex_squish = 0.7


//s.vassal_tax = 0.25		// percentage of income that goes to lord

s.market.sell_tax = 0.02
s.market.increment = 0.000005	// how much it goes up or down when someone buys or sells

s.resource.gained_at_hex = 4
s.resource.gold_gained_at_castle = 35
s.resource.gold_gained_at_village = 0
s.resource.num_rings_castle = 2
s.resource.num_rings_village = 1

s.resource.types = ['grain', 'lumber', 'ore', 'wool', 'clay', 'glass']
s.resource.types_plus_gold = ['gold'].concat(s.resource.types)

s.army.types = ['footmen', 'archers', 'pikemen', 'cavalry', 'catapults']

s.army.cost = {
	footmen: {
		grain: 120,
		lumber: 5,
		ore: 25,
		wool: 5,
		clay: 0,
		glass: 0,
	},
	archers: {
		grain: 30,
		lumber: 40,
		ore: 0,
		wool: 18,
		clay: 0,
		glass: 0,
	},
	pikemen: {
		grain: 0,
		lumber: 15,
		ore: 10,
		wool: 25,
		clay: 0,
		glass: 25,
	},
	cavalry: {
		grain: 30,
		lumber: 5,
		ore: 35,
		wool: 5,
		clay: 25,
		glass: 0,
	},
	catapults: {
		grain:600,
		lumber:500,
		ore:200,
		wool:0,
		clay:150,
		glass:0
	}
}

s.army.stats = {
	footmen: {
		offense: 10,
		defense: 10,
		speed: 8
	},
	archers: {
		offense: 5,
		defense: 15,
		speed: 11
	},
	pikemen: {
		offense: 2,
		defense: 18,
		speed: 6
	},
	cavalry: {
		offense: 15,
		defense: 5,
		speed: 16
	},
	catapults: {
		offense: 1,
		defense: 1,
		speed: 3,
		bonus_against_buildings: 600
	}
}

s.village.cost = {
	grain: 1000,
	lumber: 1000,
	ore: 1000,
	wool: 0,
	clay: 500,
	glass: 0
}

s.village.max_can_have = 6



s.village.defense_bonus = 1.5
s.castle.defense_bonus = 2
s.village.ally_defense_bonus = 1.5
s.castle.ally_defense_bonus = 1.5