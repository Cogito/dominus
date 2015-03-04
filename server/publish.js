Meteor.publish('user_data', function () {
	if (this.userId) {
		return Meteor.users.find({_id: this.userId}, {fields: {
			admin:1,
			allies:1,
			allies_above:1,
			allies_below:1,
			castle_id:1,
			clay:1,
			created_at:1,
			glass:1,
			gold:1,
			grain:1,
			is_dominus:1,
			is_king:1,
			lord:1,
			lumber:1,
			num_allies:1,
			num_allies_above:1,
			num_allies_below:1,
			num_vassals:1,
			ore:1,
			res_update:1,
			show_welcome_screen:1,
			vassals:1,
			wool:1,
			x:1,
			y:1,
			king:1,
			//siblings:1,	// not currently used
			team:1,
			lp_show_castle:1,
			lp_show_villages:1,
			lp_show_armies:1,
			lp_show_lords:1,
			lp_show_allies:1,
			hex_scale:1,
			income:1,
			networth:1,
			purchases:1,
			losses_worth:1,
			losses_num:1,
			sp_show_coords:1,
			sp_show_minimap:1,
			emails:1,
			lastActive:1,
			status:1
		}})
	} else {
		this.ready()
	}
});
