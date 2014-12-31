var subs = new ReadyManager()

Template.tree_panel.helpers({
	kings: function() {
		if (subs.ready('tree')) {
			var kings = TreePanelUsers.find({lord: null})

			var user = Meteor.users.findOne(Meteor.userId(), {fields: {king:1,x:1,y:1,castle_id:1,income:1, networth:1}})

			var kings = kings.map(function(k) {
				if (user) {
					if (user._id == k._id) {
						k.relation = 'mine'
					} else if (user.king == k._id) {
						k.relation = 'king'
					} else {
						k.relation = 'foe'
					}
				} else {
					k.relation = 'foe'
				}
				return k
			})

			return kings
		}
	},

	has_vassals: function(num_vassals) {
		return (num_vassals > 0)
	}
})

Template.tree_panel.created = function() {
	this.autorun(function() {
		subs.subscriptions([{
			groupName:'tree',
			subscriptions: [ Meteor.subscribe('tree_panel_users').ready() ]
		}])
	})
}

Template.tree_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}
