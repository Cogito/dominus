Template.tree_panel_vassals.helpers({
	vassals: function() {
		var vassals = TreePanelUsers.find({lord: this._id})

		var user = Meteor.users.findOne(Meteor.userId(), {fields: {team:1,allies_above:1,allies_below:1,lord:1,vassals:1}})

		vassals = vassals.map(function(v) {
			if (user) {

				if (user._id == v._id) {
					v.relation = 'mine'
				} else if (_.indexOf(user.team, v._id) != -1) {

					if (_.indexOf(user.allies_above, v._id) != -1) {

						if (user.lord == v._id) {
							v.relation = 'lord'
						} else {
							v.relation = 'above'
						}

					} else if (_.indexOf(user.allies_below, v._id) != -1) {

						if (_.indexOf(user.vassals, v._id) != -1) {
							v.relation = 'vassal'
						} else {
							v.relation = 'below'
						}

					// } else if (_.indexOf(user.siblings, v._id) != -1) {
					// 	v.relation = 'sibling'
					} else {
						v.relation = 'team'
					}

				} else {
					v.relation = 'foe'
				}

			} else {
				v.relation = 'foe'
			}

			return v
		})

		return vassals
	}

	,

	has_vassals: function(num_vassals) {
		return (num_vassals > 0)
	}
})