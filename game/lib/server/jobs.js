Meteor.startup(function() {

	if (process.env.DOMINUS_WORKER == 'true') {
		// delay because meteor up seems to start server twice
		Meteor.setTimeout(function() {
			console.log('--- dominus worker started ---');
			Cue.dropInProgressTasks();
			Cue.maxTasksAtOnce = 20;
			Cue.start();
		}, 1000*5);


		Meteor.defer(function() {

			// //delete villages with no owner
			// Villages.find().forEach(function(village) {
			// 	var user = Meteor.users.findOne(village.user_id)
			// 	if (!user) {
			// 		Hexes.update({x:village.x, y:village.y}, {$set: {has_building:false, nearby_buildings:false}})
			// 		Villages.remove(village._id)
			// 		console.log('deleting village')
			// 	}
			// })
			//
			// // remove duplicate castles
			// Meteor.users.find().forEach(function(u) {
			// 	Castles.find({user_id:u._id}).forEach(function(castle) {
			// 		if (castle._id != u.castle_id) {
			// 			Hexes.update({x:castle.x, y:castle.y}, {$set: {has_building:false, nearby_buildings:false}})
			// 			Castles.remove(castle._id)
			// 			console.log('deleted castle')
			// 		}
			// 	})
			// })

			// cleanup old moves
			// Moves.find().forEach(function(move) {
			// 	if (Armies.find({_id:move.army_id}).count() == 0) {
			// 		console.log('removing move')
			// 		Moves.remove(move._id)
			// 	}
			// })


			//make sure there are no negative armies
			var find = [];
			_.each(s.army.types, function(type) {
				var or = {};
				or[type] = {$lt:0};
				find.push(or);
			});

			var castles = Castles.find({$or:find});
			var villages = Villages.find({$or:find});
			var armies = Armies.find({$or:find});

			castles.forEach(function(res) {
				_.each(s.army.types, function(type) {
					if (res[type] < 0) {
						console.log('castle '+res._id+' had '+res[type]+' '+type+'s');
						var set = {};
						set[type] = 0;
						Castles.update(res._id, {$set:set});
					}
				});
			});

			villages.forEach(function(res) {
				_.each(s.army.types, function(type) {
					if (res[type] < 0) {
						console.log('village '+res._id+' had '+res[type]+' '+type+'s');
						var set = {};
						set[type] = 0;
						Villages.update(res._id, {$set:set});
					}
				});
			});

			armies.forEach(function(res) {
				_.each(s.army.types, function(type) {
					if (res[type] < 0) {
						console.log('army '+res._id+' had '+res[type]+' '+type+'s');
						var set = {};
						set[type] = 0;
						Armies.update(res._id, {$set:set});
					}
				});
			});

		});



		// army moves
		Meteor.setInterval(function() {
			Cue.addTask('armyMovementJob', {isAsync:false, unique:true}, {});
		}, s.army_update_interval);



		// village construction
		Meteor.setInterval(function() {
			Cue.addTask('villageConstructionJob', {isAsync:false, unique:true}, {});
		}, s.village.construction_update_interval);



		// resource collection
		var max = 1000 * 60 * 60;
		var current = moment().minute() * 60 * 1000;
		var ms_until;

		if (current + s.resource.interval >= max) {
			ms_until = max - current;
		} else {
			var has_passed = Math.floor(current / s.resource.interval);
			var next = (has_passed + 1) * s.resource.interval;
			ms_until = next - current;
		}

		Meteor.setTimeout(function() {
			resource_interval_jobs();
			Meteor.setInterval(function() {
				resource_interval_jobs();
			}, s.resource.interval);
		}, ms_until);




		// nightly job
		var endOfDay = moment().endOf('day').add(2, 'minutes');
		var timeUntilMidnight = endOfDay - moment();
		Meteor.setTimeout(function() {
			midnightJob();
			Meteor.setInterval(function() {
				midnightJob();
			}, 1000 * 60 * 60 * 24);
		}, timeUntilMidnight);



		// every 10 minutes
		Meteor.setInterval(function() {
			Cue.addTask('gamestats_job', {isAsync:false, unique:true}, {});
			Cue.addTask('updateIncomeRank', {isAsync:false, unique:true}, {});
			Cue.addTask('updateIncomeStats', {isAsync:false, unique:true}, {});
			Cue.addTask('generateTree', {isAsync:false, unique:true}, {});
		}, 1000 * 60 * 10);


		// hourly job
		Meteor.setInterval(function() {
			Cue.addTask('deleteInactiveUsers_new', {isAsync:false, unique:true}, {});
		}, 1000 * 60 * 60);


		// game over job
		// check to see if game is over and send alert
		Meteor.setInterval(function() {
			Cue.addTask('checkForGameOver', {isAsync:false, unique:true}, {});
		}, 1000 * 60);
	}
});



var midnightJob = function() {
	// is this still needed?
	Meteor.users.find().forEach(function(user) {
		Cue.addTask('dailystats_num_allies', {isAsync:false, unique:true}, {user_id:user._id});
	});
	Cue.addTask('updateNetForEveryone', {isAsync:false, unique:true}, {});
};


var resource_interval_jobs = function() {
	Cue.addTask('record_market_history', {isAsync:true, unique:false}, {quantity:0});
	Cue.addTask('gatherResources', {isAsync:false, unique:true}, {});
	Cue.addTask('spendTaxes', {isAsync:false, unique:true}, {});
};
