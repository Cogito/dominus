if (Meteor.isClient) {
	s.game_name = 'Dominus'
	s.game_number = 12
	s.game_start_date = moment("2015-03-14 1:00 pm -0700", "YYYY-MM-DD h:m a Z").toDate()

	s.hex_move_speed = 12		// how fast does the grid move when moving
	s.hex_scale_max = 1
	s.hex_scale_min = 0.5

	s.army_travel_multiplier = 1
}
