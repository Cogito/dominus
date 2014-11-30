if (Meteor.isClient) {
	s.game_name = 'Dominus'
	s.game_number = 7
	s.game_start_date = moment("2014-11-08 7:30 pm -0700", "YYYY-MM-DD h:m a Z").toDate()
	s.down_for_maintenance = false

	s.hex_move_speed = 20		// how fast does the grid move when moving
	s.hex_scale_max = 1
	s.hex_scale_min = 0.7

	s.army_travel_multiplier = 1
}