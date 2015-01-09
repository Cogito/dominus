Meteor.methods({
	set_hex_scale: function(num) {
		check(num, validNumber)
		this.unblock()
		Meteor.users.update(Meteor.userId(), {$set: {hex_scale: num}})
	}
})
