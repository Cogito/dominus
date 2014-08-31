Meteor.methods({
	set_hex_scale: function(num) {
		check(num, Number)

		Meteor.users.update(Meteor.userId(), {$set: {hex_scale: num}})
	}
})