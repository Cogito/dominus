Meteor.methods({

	// moves = [{from_x:0, from_y:0, to_x:0, to_y:0}, {from_x:0, from_y:0, to_x:0, to_y:0}]
	create_moves: function(army_id, moves) {
		this.unblock()
		check(army_id, String)
		check(moves, Array)

		if (moves.length < 1) {
			return false
		}

		var army = Armies.findOne({_id:army_id, user_id:Meteor.userId()}, {fields: {x:1, y:1}})
		if (army) {

			// make sure army is at start of first move
			if (army.x != moves[0].from_x && army.y != moves[0].from_y) {
				return false
			}

			// delete old moves
			Moves.remove({army_id:army._id, user_id:Meteor.userId()})

			_.each(moves, function(move, index) {
				check(move.from_x, Number)
				check(move.from_y, Number)
				check(move.to_x, Number)
				check(move.to_y, Number)
				Moves.insert({
					from_x:move.from_x,
					from_y:move.from_y,
					to_x:move.to_x,
					to_y:move.to_y,
					index:index,
					army_id:army._id,
					user_id:Meteor.userId(),
					created_at:new Date(),
					last_move_at:new Date()
				})
			})
		}
	},


	remove_all_moves: function(army_id) {
		this.unblock()
		check(army_id, String)
		Moves.remove({user_id:Meteor.userId(), army_id:army_id})
	},


	remove_move: function(move_id) {
		this.unblock()
		check(move_id, String)

		var move = Moves.findOne({_id:move_id, user_id:Meteor.userId()})
		if (!move) {
			return false
		}

		var army = Armies.findOne(move.army_id, {fields: {x:1, y:1}})
		if (!army) {
			return false
		}

		var moves = Moves.find({army_id:army._id, user_id:Meteor.userId()}, {sort: {index:1}})
		var num_moves = moves.count()

		if (num_moves == 0) {
			return false
		}

		// remove first
		if (move.index == 0 && num_moves > 1) {
			// set second to start from where he is now
			var sec_move = Moves.findOne({army_id:army._id, user_id:Meteor.userId(), index:1})
			Moves.update(sec_move._id, {$set: {from_x:army.x, from_y:army.y}})

			// remove
			Moves.remove({_id:move_id})

			// update index
			var i = 0
			Moves.find({army_id:army._id, user_id:Meteor.userId()}, {sort: {index:1}}).forEach(function(m) {
				Moves.update(m._id, {$set: {index:i}})
				i++
			})
		}
		

		// remove last
		if (move.index != 0 && move.index+1 == num_moves) {
			// remove
			Moves.remove({_id:move_id})
		}

		// remove middle
		if (move.index > 0 && num_moves > move.index+1) {
			// set from of one after to to of one before
			var after_move = Moves.findOne({army_id:army._id, user_id:Meteor.userId(), index:move.index+1})
			var prev_move = Moves.findOne({army_id:army._id, user_id:Meteor.userId(), index:move.index-1})
			Moves.update(after_move._id, {$set: {from_x:prev_move.to_x, from_y:prev_move.to_y}})

			// remove
			Moves.remove({_id:move_id})

			// update index
			var i = 0
			Moves.find({army_id:army._id, user_id:Meteor.userId()}, {sort: {index:1}}).forEach(function(m) {
				Moves.update(m._id, {$set: {index:i}})
				i++
			})
		}

		// remove only
		if (move.index == 0 && num_moves == 1) {
			// remove
			Moves.remove({_id:move_id})
		}
	},

	
	army_join_building: function(army_id) {
		this.unblock()
		check(army_id, String)

		var user_id = Meteor.userId()

		var fields = {x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})
		
		var army = Armies.findOne({_id:army_id, user_id:user_id}, {fields: fields})
		if (army) {
			var inc = {}
			_.each(s.army.types, function(type) {
				inc[type] = army[type]
			})

			var castle = Castles.findOne({x:army.x, y:army.y, user_id:user_id}, {fields: {_id:1}})
			if (castle) {
				Castles.update(castle._id, {$inc:inc})
				Armies.remove(army._id)
				Moves.remove({army_id:army._id})
			} else {
				var village = Villages.findOne({x:army.x, y:army.y, user_id:user_id}, {fields: {_id:1}})
				if (village) {
					
					Villages.update(village._id, {$inc: inc})
					Armies.remove(army._id)
					Moves.remove({army_id:army._id})
				}
			}
		}
	},

	split_armies: function(id, new_army) {
		var fields = {castle_id:1, x:1, y:1}

		_.each(s.army.types, function(type) {
			fields[type] = 1
		})

		var res = Armies.findOne({_id: id, user_id: Meteor.userId()}, {fields: fields})
		if (res) {
			var oldNum = 0
			_.each(s.army.types, function(type) {
				oldNum += res[type]
			})

			var newNum = 0
			_.each(s.army.types, function(type) {
				newNum += new_army[type]
			})

			if (newNum > 0) {
				if (newNum < oldNum) {
					var new_id = Meteor.call('create_army', new_army, res.x, res.y, [])

					var set = {}
					_.each(s.army.types, function(type) {
						set[type] = res[type] - new_army[type]
					})

					Armies.update(res._id, {$set: set})
					return new_id
				}
			}
		} else {
			throw new Meteor.Error('Could not find army.')
		}
	},



	disband_army: function(id) {
		this.unblock()
		var res = Armies.findOne({_id: id, user_id: Meteor.userId()}, {fields: {_id:1}})
		if (res) {
			Armies.remove({_id: id})
			Moves.remove({army_id:id})
		}
		if (!this.isSimulation) {
			worker.enqueue('update_networth', {user_id: Meteor.userId()})
		}
	},

	combine_armies: function(army_id) {
		this.unblock()
		check(army_id, String)
	
		var army = Armies.findOne(army_id, {fields: {x:1, y:1}})
		if (army) {
			var fields = {}

			_.each(s.army.types, function(type) {
				fields[type] = 1
			})

			Armies.find({user_id: Meteor.userId(), x: army.x, y: army.y}, {fields: fields}).forEach(function(a) {
				if (a._id != army_id) {
					var inc = {}

					_.each(s.army.types, function(type) {
						inc[type] = a[type]
					})

					Armies.update(army_id, {$inc: inc})

					Armies.remove(a._id)
					Moves.remove({army_id:a._id})
				}
			})
		}
	},

})