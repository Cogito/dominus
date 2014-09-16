if (Meteor.isClient) {

	s.down_for_maintenance = false

	s.game_end = moment("2014-08-01 7:30 pm -0700", "YYYY-MM-DD h:m a Z").toDate()

	s.hex_move_speed = 20		// how fast does the grid move when moving
	s.use_onscreen_subscribe_delay = false
	s.hex_scale_max = 1
	s.hex_scale_min = 0.7

	s.army_travel_multiplier = 1

}