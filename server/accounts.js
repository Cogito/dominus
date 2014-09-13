Accounts.onCreateUser(function(options, user) {
	if (options.profile) {
		user.profile = options.profile;
	} else {
		user.profile = {};
	}

	// set admin
	user.admin = false;

	// this should probably be changed to a env variable
	if (user.emails[0].address == process.env.DOMINUS_ADMIN_EMAIL) {
		user.admin = true
	}

	user.gold = s.starting_resources.gold
	user.grain = s.starting_resources.grain
	user.lumber = s.starting_resources.lumber
	user.ore = s.starting_resources.ore
	user.clay = s.starting_resources.clay
	user.glass = s.starting_resources.glass
	user.wool = s.starting_resources.wool
	user.created_at = new Date()
	user.lord = null
	user.vassals = []
	user.allies = []
	user.allies_below = []
	user.allies_above = []
	user.chatrooms = []
	//user.lord_chatroom = null
	user.king_chatroom = null
	user.is_king = true
	user.is_dominus = false
	user.show_welcome_screen = true
	user.num_vassals = 0
	user.num_allies = 0
	user.num_allies_above = 0
	user.num_allies_below = 0
	user.res_update = {
		gold: 0,
		grain: 0,
		lumber: 0,
		ore: 0,
		wool: 0,
		clay: 0,
		glass: 0
	}
	user.lp_show_armies = true
	user.lp_show_lord = true
	user.lp_show_vassals = true
	user.hex_scale = 1
	user.income = 0
	user.purchases = {
		castles: [s.castle.starting_image]
	}
	user.losses = {}
	user.losses_worth = 0
	user.sp_show_coords = false
	user.sp_show_minimap = true

	// var everyone = Chatrooms.findOne({name: 'Everyone'}, {fields: {_id:1}})
	// user.chatrooms = [everyone._id]

	// set game winner
	// xom from game 1
	if (user.emails[0].address == 'hmliang@gmail.com') {
		user.is_game_winner = true
	}
	// hertle from game 2
	if (user.emails[0].address == 'travel_on@hotmail.com') {
		user.is_game_winner = true
	}


	// if someone was dominus make them not dominus
	remove_dominus()

	return user
})


// check when user logs in if they have a castle
// if not then they are a new user
Accounts.onLogin(function(data) {
	if (data.user && !data.user.castle_id) {
		onCreateUser(data.user._id)
	}
})


onCreateUser = function(userId) {
	worker.enqueue('create_castle', {user_id: userId})
	//worker.enqueue('inc_daily_stats', {user_id: userId, new_stats: {}, add_to: false})
	init_dailystats_for_new_user(userId)

	// subscribe to everyone chat
	var everyone = Chatrooms.findOne({name: 'Everyone'}, {fields: {_id:1}})

	// if not one create it
	if (!everyone) {
		var id = create_chat('Everyone', false, null)
	} else {
		var id = everyone._id
	}

	subscribe_to_chatroom(userId, id)
}