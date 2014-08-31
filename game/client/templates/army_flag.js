Template.army_flag.helpers({
	draw: function() {
		var self = this
		var draw = true
		Armies.find({x: self.x, y: self.y, _id: {$ne: self._id}}, {fields: {last_move_at:1}}).forEach(function(res) {
			if (self.last_move_at > res.last_move_at) {
				draw = false
			}
		})
		return draw
	},

	flags: function() {

		if (Meteor.userId()) {

			var user = Meteor.users.findOne(Meteor.userId(), {lord:1, allies_above:1, allies_below:1, team:1, king:1, vassals:1})
			if (user) {
				var numMine = 0
				var numKing = 0
				var numLord = 0
				var numAbove = 0
				var numVassal = 0
				var numBelow = 0
				//var numSibling = 0
				var numTeam = 0
				var numFoe = 0

				Armies.find({x:this.x, y:this.y}, {fields: {user_id:1}}).forEach(function(res) {

					if (res.user_id == user._id) {
						numMine++
					} else if (_.indexOf(user.team, res.user_id) != -1) {

						if (_.indexOf(user.allies_above, res.user_id) != -1) {

							if (res.user_id == user.king) {
								numKing++
							} else if (res.user_id == user.lord) {
								numLord++
							} else {
								numAbove++
							}

						} else if (_.indexOf(user.allies_below, res.user_id) != -1) {

							if (_.indexOf(user.vassals, res.user_id) != -1) {
								numVassal++
							} else {
								numBelow++
							}

						// } else if (_.indexOf(user.siblings, res.user_id) != -1) {
						// 	numSibling++
						} else {
							numTeam++
						}
					} else {
						numFoe++
					}

				})

				var flags = []
				var index = 0
				var drawNum = false
				var shape_size = 10 +1
				var offset = -20

				if (numMine > 0) {
					if (numMine > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numMine, offset: offset, textOffset: offset+9, type: 'mine', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numKing > 0) {
					if (numKing > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numKing, offset: offset, textOffset: offset+9, type: 'king', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numLord > 0) {
					if (numLord > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numLord, offset: offset, textOffset: offset+9, type: 'lord', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numAbove > 0) {
					if (numAbove > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numAbove, offset: offset, textOffset: offset+9, type: 'above', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numVassal > 0) {
					if (numVassal > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numVassal, offset: offset, textOffset: offset+9, type: 'vassal', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numBelow > 0) {
					if (numBelow > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numBelow, offset: offset, textOffset: offset+9, type: 'below', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				// if (numSibling > 0) {
				// 	if (numSibling > 1) {
				// 		drawNum = true
				// 	} else {
				// 		drawNum = false
				// 	}
				// 	offset += shape_size
				// 	flags[index] = {num: numSibling, offset: offset, textOffset: offset+9, type: 'sibling', x: this.x, y: this.y, drawNum: drawNum}
				// 	index++
				// }

				if (numTeam > 0) {
					if (numTeam > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numTeam, offset: offset, textOffset: offset+9, type: 'team', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				if (numFoe > 0) {
					if (numFoe > 1) {
						drawNum = true
					} else {
						drawNum = false
					}
					offset += shape_size
					flags[index] = {num: numFoe, offset: offset, textOffset: offset+9, type: 'foe', x: this.x, y: this.y, drawNum: drawNum}
					index++
				}

				return flags
			}
		}
	}

})