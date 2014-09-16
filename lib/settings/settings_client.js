if (Meteor.isClient) {
	s.game_name = 'Dominus'
	s.game_number = 5
	s.game_start_date = moment("2014-09-01 7:30 pm -0700", "YYYY-MM-DD h:m a Z").toDate()
	s.down_for_maintenance = false

	//s.next_game_start_date = moment("2014-08-01 7:30 pm -0700", "YYYY-MM-DD h:m a Z").toDate()
	s.next_game_start_date = null

	s.hex_move_speed = 20		// how fast does the grid move when moving
	s.use_onscreen_subscribe_delay = false
	s.hex_scale_max = 1
	s.hex_scale_min = 0.7

	s.army_travel_multiplier = 1
}