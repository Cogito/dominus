if (Meteor.isServer) {

	if (process.env.NODE_ENV == 'development') {
		// cheats
		s.army_travel_multiplier = 0.00001
		s.battle_check_interval = 1000 * 10
	} else {
		s.army_travel_multiplier = 1 	// for debug, lower than one makes armies move faster
		s.battle_check_interval = 1000 * 15
	}

	// winner loses x percent of s.battle_dead_per_round_lose or x percent of soldiers in enemy armies
	//s.battle_dead_per_round_win_percentage = 0.3
	//s.battle_dead_per_round_lose = 10
	s.battle_power_lost_per_round = 200
	s.battle_power_lost_per_round_winner = 160

	s.army_update_interval = 1000 * 5	// how often does army movement job run

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

	s.market.start_price = {
		grain:2,
		lumber:10,
		ore:10,
		wool:10,
		clay:10,
		glass:10
	}

	// which image to use for hex
	// this is how many are available
	s.resource.numTileImages = {}
	s.resource.numTileImages.grain = 3
	s.resource.numTileImages.lumber = 1
	s.resource.numTileImages.ore = 1
	s.resource.numTileImages.wool = 1
	s.resource.numTileImages.clay = 1
	s.resource.numTileImages.glass = 1

	s.castle.starting_garrison = {
		footmen: 2,
		archers: 2,
		pikemen: 10,
		cavalry: 0,
		catapults: 0
	}

	s.castle.starting_image = 'castle_02_keep'

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

}