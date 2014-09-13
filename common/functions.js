
seperate_number_with_commas = function(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

round_number = function(num) {
	return seperate_number_with_commas(Math.round(num))
}

round_number_1 = function(num) {
	return seperate_number_with_commas(Math.round(num * 10) / 10)
}

round_number_2 = function(num) {
	return seperate_number_with_commas(Math.round(num * 100) / 100)
}



/////////////////////////////////////////////////////////////////////////////////
// User Properties
/////////////////////////////////////////////////////////////////////////////////

get_user_property = function (property) {
	var fields = {}
	fields[property] = 1
	var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
	if (user) {
			return user[property]
	}
}