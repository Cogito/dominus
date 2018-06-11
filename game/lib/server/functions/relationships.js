// allies - everyone above and below you in tree not including self
// allies_below - everyone below not including self
// allies_above - everyone above not including self
// king - your king (sometimes yourself if you are king sometimes null or undefined if you are king, should fix this)
//		TODO: when user is created this is null even though they are a king
// is_king - are you king
// team - everyone under your king - may or may not include self
//		used to not include self, including self now to speed up relations.js
//		TODO: when user is created team does not include self


set_lord_and_vassal = function(winner_id, loser_id) {
	var fields = {allies_above:1, lord:1, king:1, is_king:1};

	var winner = Meteor.users.findOne(winner_id, {fields:fields});
	var loser = Meteor.users.findOne(loser_id, {fields:fields});

	if (!winner || !loser) {
		throw new Meteor.Error('winner or loser not found');
	}

	if (winner._id == loser._id) {
		throw new Meteor.Error('winner and loser are the same in set_lord_and_vassal');
	}

	// lost/gained vassal notifications
	// compare people above loser to people above winner
	// if someone above loser is not above winner then they lost a vassal
	// do opposite for gained

	_.each(loser.allies_above, function(above_loser_lord_id) {
		if (_.indexOf(winner.allies_above, above_loser_lord_id) == -1) {

			// make sure we don't send it to winner or loser
			if (above_loser_lord_id != winner._id && above_loser_lord_id != loser._id) {
				alert_lostVassal(above_loser_lord_id, loser._id, winner._id);
			}
		}
	});

	_.each(winner.allies_above, function(above_winner_lord_id) {
		if (_.indexOf(loser.allies_above, above_winner_lord_id) == -1) {

			// make sure we don't send it to winner or loser
			if (above_winner_lord_id != winner._id && above_winner_lord_id != loser._id) {
				alert_gainedVassal(above_winner_lord_id, loser._id, winner._id);
			}
		}
	});

	// send notification to winner
	alert_gainedVassal(winner._id, loser._id, winner._id);

	// vassal is no longer a king, he had no lord, now he does
	// destroy king chatroom
	if (loser.is_king) {
		Cue.addTask('destroyKingChatroom', {isAsync:false, unique:true}, {king_id:loser._id});
	}

	// is loser above winner
	// he is either above winner or he is in a different branch
	if (_.indexOf(winner.allies_above, loser._id) != -1) {

		// winner is conquering his lord, moving up the tree
		remove_lord_and_vassal(winner.lord, winner._id);

		// loser's lord is now winner's lord
		if (loser.lord) {
			remove_lord_and_vassal(loser.lord, loser._id);
			create_lord_and_vassal(loser.lord, winner._id);
		}

	// winner is stealing loser from another lord
	// remove connection between loser and his lord
	// create notification for old lord that he lost a vassal
	} else if (loser.lord) {
		remove_lord_and_vassal(loser.lord, loser._id);
	}

	// create connection between winner and loser
	create_lord_and_vassal(winner._id, loser._id);

	// is winner a new king
	// has he conquered his lord?
	if (winner.king == loser._id) {
		Meteor.users.update(winner._id, {$set: {is_king:true}});
	}

	// send notification
	alert_newLord(loser._id, winner._id);

	Cue.addTask('enemies_together_check', {isAsync:false, unique:true, delay:500}, {});
	Cue.addTask('enemy_on_building_check', {isAsync:false, unique:true, delay:500}, {});
	Cue.addTask('check_for_dominus', {isAsync:false, unique:true, delay:500}, {});
	Cue.addTask('cleanupAllKingChatrooms', {isAsync:false, unique:true, delay:500}, {});
};



// remove lord and vassal connection
// vassal is now king
remove_lord_and_vassal = function(lord_id, vassal_id) {
	check(lord_id, String);
	check(vassal_id, String);

	if (lord_id == vassal_id) {
		throw new Meteor.Error('winner and loser are the same in remove_lord_and_vassal');
	}

	var fields = {allies_above:1, allies_below:1};
	var lord = Meteor.users.findOne(lord_id, {fields:fields});
	var vassal = Meteor.users.findOne(vassal_id, {fields:fields});

	if (!lord || !vassal) {
		throw new Meteor.Error('lord or vassal not found');
	}

	// vassal
	Meteor.users.update(lord_id, {$pull: {
		vassals: vassal_id
	}});

	// lord
	Meteor.users.update(vassal_id, {$set: {
		lord: null
	}});

	// allies
	// remove lord and lord's allies_above from 		vassal and vassal's allies_below
	// allies_above
	// remove lord and lord's allies_above from 		vassal and vassal's allies_below
	var pullIds = _.union(lord.allies_above, [lord._id]);
	var pullUsers = _.union(vassal.allies_below, [vassal._id]);
	Meteor.users.update({_id: {$in:pullUsers}}, {$pull: {allies_above:{$in:pullIds}}}, {multi:true});

	// allies
	// remove vassal and vassal's allies_below from 	lord and lord's allies_above
	// allies_below
	// remove vassal and vassal's allies_below from 	lord and lord's allies_above
	var pullVassalIds = _.union(vassal.allies_below, [vassal._id]);
	var pullVassalUsers = _.union(lord.allies_above, [lord._id]);
	Meteor.users.update({_id: {$in:pullVassalUsers}}, {$pull: {allies_below:{$in:pullVassalIds}}}, {multi:true});

	// king
	// vassal is now king
	// vassal is now king of everyone below him
	Meteor.users.update(vassal._id, {$set:{is_king:true}});
	var setUsers = vassal.allies_below;
	Meteor.users.update({_id:{$in:setUsers}}, {$set:{king:vassal._id}}, {multi:true});

	// team
	// remove vassal and vassal's allies_below from everyone's team
	var teamIds = _.union(vassal.allies_below, [vassal._id]);
	Meteor.users.update({}, {$pull: {team:{$in:teamIds}}}, {multi:true});
	// vassal's team = vassal's new allies_below plus self
	Meteor.users.update({_id:{$in:teamIds}}, {$set:{team:teamIds}}, {multi:true});

	// update count of everyone who was changed
	var ids = _.union([lord_id, vassal_id], lord.team, vassal.team);
	_.each(ids, function(id) {
		if (id) {
			Cue.addTask('updateVassalAllyCount', {isAsync:true, unique:false}, {user_id:id});
		}
	});
};



create_lord_and_vassal = function(lord_id, vassal_id) {
	check(lord_id, String);
	check(vassal_id, String);

	if (lord_id == vassal_id) {
		console.log('lord '+lord_id);
		console.log('vassal '+vassal_id);
		console.error('winner and loser are the same in create_lord_and_vassal');
	}

	var fields = {allies_above:1, allies_below:1, king:1, team:1, is_king:1};
	var lord = Meteor.users.findOne(lord_id, {fields:fields});
	var vassal = Meteor.users.findOne(vassal_id, {fields:fields});

	if (!lord || !vassal) {
		console.log('lord '+lord_id);
		console.log('vassal '+vassal_id);
		console.error('lord or vassal not found');
	}

	check(lord.allies_above, Array);
	check(lord.allies_below, Array);
	check(lord.team, Array);
	check(vassal.allies_above, Array);
	check(vassal.allies_below, Array);
	check(vassal.team, Array);

	// vassal must not have a lord
	// if so call remove first
	if (vassal.lord) {
		console.log('lord '+lord_id);
		console.log('vassal '+vassal_id);
		console.error('vassal must not have a lord');
	}

	// set vassal and vassal's allies below's king to king of lord
	var newKing = null;
	if (lord.is_king) {
		newKing = lord._id;
	} else if (lord.king){
		newKing = lord.king;
	} else {
		console.log('lord '+lord_id);
		console.log('vassal '+vassal_id);
		console.error('lords king is not set');
	}
	Meteor.users.update({_id:{$in:vassal.allies_below}}, {$set:{king:newKing}}, {multi:true});

	// set lord and remove king
	Meteor.users.update(vassal_id, {$set: {
		lord: lord_id,
		is_king:false
	}});

	// set vassal
	Meteor.users.update(lord_id, {$addToSet: {
		vassals: vassal_id
	}});

	// allies_above and allies
	// add lord and lord's allies_above to 		vassal and vassal's allies below allies_above
	// add lord and lord's allies_above to		vassal and vassal's allies below allies
	var addIds = _.union(lord.allies_above, [lord._id]);
	var addUsers = _.union(vassal.allies_below, [vassal._id]);
	Meteor.users.update({_id: {$in:addUsers}}, {$addToSet: {allies_above:{$each:addIds}}}, {multi:true});

	// allies_below and allies
	// add vassal and vassal's allies_below to 	lord and lord's allies above allies_below
	// add vassal and vassal's allies_below to	lord and lord's allies above allies
	var addVassalIds = _.union(vassal.allies_below, [vassal._id]);
	var addVassalUsers = _.union(lord.allies_above, [lord._id]);
	Meteor.users.update({_id: {$in:addVassalUsers}}, {$addToSet: {allies_below:{$each:addVassalIds}}}, {multi:true});

	// team
	// add vassal and vassal's allies_below to lord's team
	var team = _.union(lord.team, [lord._id, vassal._id], vassal.allies_below);
	Meteor.users.update({_id:{$in:team}}, {$set:{team:team}}, {multi:true});

	// update count of everyone who was changed
	var ids = _.union([lord_id, vassal_id], lord.team);
	_.each(ids, function(id) {
		if (id) {
			Cue.addTask('updateVassalAllyCount', {isAsync:true, unique:false}, {user_id:id});
		}
	});
};



Cue.addJob('updateVassalAllyCount', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
	update_vassal_ally_count(task.data.user_id);
	done();
});

// used for rankings
update_vassal_ally_count = function(user_id) {
	check(user_id, String);

	var user = Meteor.users.findOne(user_id, {fields: {team:1, vassals:1, allies_above:1, allies_below:1}});
	if (user) {
		var num_vassals = 0;
		if (user.vassals) {
			num_vassals = user.vassals.length;
		}

		var num_allies_above = 0;
		if (user.allies_above) {
			num_allies_above = user.allies_above.length;
		}

		var num_allies_below = 0;
		if (user.allies_below) {
			num_allies_below = user.allies_below.length;
		}

		var num_team = 0;
		if (user.team) {
			num_team = user.team.length;
		}

		Meteor.users.update(user_id, {$set: {num_team:num_team, num_vassals: num_vassals, num_allies_above: num_allies_above, num_allies_below: num_allies_below}});
		Cue.addTask('dailystats_num_allies', {isAsync:true, unique:false}, {user_id:user_id});
	}
};
