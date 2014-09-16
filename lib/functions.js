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



// clone object before returning so that it doesn't return a reference
cloneObject = function(obj){
	if(obj == null || typeof(obj) != 'object')
		return obj;

	var temp = obj.constructor(); // changed

	for(var key in obj)
		temp[key] =	this.cloneObject(obj[key]);
	return temp;
}


cloneArray = function(arr) {
	return arr.slice(0)
}


validNumber = Match.Where(function(num) {
	num = Number(num)

	if (isNaN(num)) {
		return false
	}

	if (!isFinite(num)) {
		return false
	}

	return true
})