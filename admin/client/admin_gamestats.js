Template.admin_gamestats.helpers({
	gamestats: function() {
		return Gamestats.find({}, {sort: {created_at:-1}})
	},
})