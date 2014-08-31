// this file needs to be split into server settings, client settings and common settings

s = {}
s.market = {}
s.resource = {}
s.army = {}
s.village = {}
s.castle = {}


if (Meteor.isServer && process.env.NODE_ENV == 'development') {
	// cheats
	s.army_travel_multiplier = 0.00001
	s.resource.interval = 1000 * 60 * 1
	s.battle_check_interval = 1000 * 10
	s.battle_interval = 1000 * 60 * 1
} else {
	s.army_travel_multiplier = 1 	// for debug, lower than one makes armies move faster
	s.resource.interval = 1000 * 60 * 10
	s.battle_check_interval = 1000 * 15
	s.battle_interval = 1000 * 60 * 5
}
s.battle_dead_per_round_win = 12
s.battle_dead_per_round_lose = 20

s.down_for_maintenance = false

s.game_name = 'Dominus'
s.game_end = moment("2014-08-01 7:30 pm -0700", "YYYY-MM-DD h:m a Z").toDate()

// settings
s.hex_size = 60
s.hex_squish = 0.7
s.hex_move_speed = 20		// how fast does the grid move when moving
s.use_onscreen_subscribe_delay = false
s.hex_scale_max = 1
s.hex_scale_min = 0.7

// game settings

s.army_update_interval = 1000 * 5	// how often does army movement job run
s.vassal_tax = 0.25		// percentage of income that goes to lord
s.create_castle = {
	check_buildings_num_rings: 5,
	check_workers_army_num_rings: 3
}


// hex generation chances
s.gen = {
	grain_min: 0,
	grain_max: 0.5,
	lumber_min: 0.5,
	lumber_max: 0.68,
	ore_min: 0.68,
	ore_max: 0.81,
	wool_min: 0.81,
	wool_max: 0.93,
	clay_min: 0.93,
	clay_max: 0.97,
	glass_min: 0.97,
	glass_max: 1
}

s.market.sell_tax = 0.02
s.market.increment = 0.000005	// how much it goes up or down when someone buys or sells
s.market.start_price = {
	grain:2,
	lumber:10,
	ore:10,
	wool:10,
	clay:10,
	glass:10
}

s.resource.gained_at_hex = 4
s.resource.gold_gained_at_castle = 40
s.resource.gold_gained_at_village = 0
s.resource.num_rings_castle = 2
s.resource.num_rings_village = 1


s.resource.types = ['grain', 'lumber', 'ore', 'wool', 'clay', 'glass']
s.resource.types_plus_gold = ['gold'].concat(s.resource.types)

// which image to use for hex
// this is how many are available
s.resource.numTileImages = {}
s.resource.numTileImages.grain = 3
s.resource.numTileImages.lumber = 1
s.resource.numTileImages.ore = 1
s.resource.numTileImages.wool = 1
s.resource.numTileImages.clay = 1
s.resource.numTileImages.glass = 1


s.army.types = ['footmen', 'archers', 'pikemen', 'cavalry', 'catapults']

s.army.cost = {
	footmen: {
		grain: 120,
		lumber: 10,
		ore: 20,
		wool: 5,
		clay: 0,
		glass: 0,
	},
	archers: {
		grain: 30,
		lumber: 40,
		ore: 8,
		wool: 10,
		clay: 0,
		glass: 0,
	},
	pikemen: {
		grain: 0,
		lumber: 10,
		ore: 10,
		wool: 25,
		clay: 0,
		glass: 15,
	},
	cavalry: {
		grain: 30,
		lumber: 10,
		ore: 35,
		wool: 5,
		clay: 15,
		glass: 0,
	},
	catapults: {
		grain:600,
		lumber:500,
		ore:200,
		wool:0,
		clay:150,
		glass:0
	},
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
		bonus_against_buildings: 800
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

// give to new user
s.starting_resources = {
	gold: 2000,
	grain: 2000,
	lumber: 2000,
	ore: 2000,
	wool: 200,
	clay: 1000,
	glass: 0
}

s.village.defense_bonus = 1.5
s.castle.defense_bonus = 2
s.village.ally_defense_bonus = 1.5
s.castle.ally_defense_bonus = 1.5

s.castle.starting_garrison = {
	footmen: 2,
	archers: 2,
	pikemen: 10,
	cavalry: 0,
	catapults: 0
}

s.castle.starting_image = 'castle_02_keep'

s.stripe = {
	publishable_key: Meteor.settings.public.stripe_public_key,
	// gold_200: 1,		// 1
	// gold_500: 3,		// 2.5 	1.2
	// gold_1000: 7, 		// 5 	1.4
	// gold_2000: 16, 		// 10 	1.6
	// gold_4000: 36, 	 	// 20 	1.8
	// num_footmen: 3,
	// num_archers: 3,
	// num_pikemen: 3,
	// num_cavalry: 3
}
