// both client and server
s = {}
s.market = {}
s.resource = {}
s.army = {}
s.village = {}
s.castle = {}
s.rankings = {}

s.rankings.perPage = 10

if (Meteor.isServer && process.env.NODE_ENV == 'development') {
	// cheats
	s.resource.interval = 1000 * 15
	s.battle_interval = 1000 * 30
} else {
	s.resource.interval = 1000 * 60 * 10
	s.battle_interval = 1000 * 60 * 5
}

s.hex_size = 60
s.hex_squish = 0.7

// winner loses x percent of s.battle_dead_per_round_lose or x percent of soldiers in enemy armies
// double so that when attacking a castle you lost about the same amount as the castle
s.battle_power_lost_per_round = 500
s.battle_power_lost_per_round_winner = 200

// length of time added to game end clock when there is a new dominus
s.time_til_game_end_when_new_dominus = 1000 * 60 * 60 * 24 * 7 	// 7 days

//s.vassal_tax = 0.25		// percentage of income that goes to lord

s.market.sell_tax = 0.1
s.market.increment = 0.000005	// how much it goes up or down when someone buys or sells

s.resource.gained_at_hex = 4
s.resource.gold_gained_at_castle = 50
s.resource.gold_gained_at_village = 8
s.resource.num_rings_castle = 2
s.resource.num_rings_village = 1
s.resource.large_resource_multiplier = 4 	// large resource hexes give you x times as much

s.resource.types = ['grain', 'lumber', 'ore', 'wool', 'clay', 'glass']
s.resource.types_plus_gold = ['gold'].concat(s.resource.types)

s.army.types = ['footmen', 'archers', 'pikemen', 'cavalry', 'catapults']

s.army.cost = {
	footmen: {
		grain: 100,
		lumber: 5,
		ore: 15,
		wool: 2,
		clay: 0,
		glass: 0,
	},
	archers: {
		grain: 35,
		lumber: 35,
		ore: 0,
		wool: 25,
		clay: 0,
		glass: 5,
	},
	pikemen: {
		grain: 0,
		lumber: 15,
		ore: 0,
		wool: 35,
		clay: 0,
		glass: 35,
	},
	cavalry: {
		grain: 30,
		lumber: 5,
		ore: 35,
		wool: 5,
		clay: 30,
		glass: 0,
	},
	catapults: {
		grain:75,
		lumber:30,
		ore:60,
		wool:0,
		clay:18,
		glass:0
	}
}

s.army.stats = {
	footmen: {
		offense: 10,
		defense: 10,
		speed: 10
	},
	archers: {
		offense: 5,
		defense: 15,
		speed: 14
	},
	pikemen: {
		offense: 2,
		defense: 18,
		speed: 7
	},
	cavalry: {
		offense: 15,
		defense: 5,
		speed: 20
	},
	catapults: {
		offense: 1,
		defense: 1,
		speed: 3,
		bonus_against_buildings: 65
	}
}

s.village.cost = {
	grain: 1000,
	lumber: 500,
	ore: 500,
	wool: 0,
	clay: 500,
	glass: 0
}

s.village.max_can_have = 7
s.village.time_to_build = 1000 * 60 * 30 	// 30 min


s.village.defense_bonus = 1.5
s.castle.defense_bonus = 2
s.village.ally_defense_bonus = 1.5
s.castle.ally_defense_bonus = 1.5


s.income = {}
s.income.percentToLords = 0.06
s.income.maxToLords = 0.3
