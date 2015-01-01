jobqueue = function() {
	this.is_busy = false
	this.jobs = {}
	this.restart_timer = undefined
	this.restart_timer_interval = 1000 * 60 * 5	// 5 min
	this.timer_interval = 1000

	this.process = function() {
		var self = this
		if (!self.is_busy) {
			var job = Jobqueue.findOne({}, {sort: {created_at: 1}})
			if (job) {
				self.is_busy = true
				var func = self.jobs[job.name]

				if (self.restart_timer) { Meteor.clearTimeout(self.restart_timer) }
				self.restart_timer = Meteor.setTimeout(function() { self.process() }, self.restart_timer_interval)

				var start_time = new Date()

				func(job.params, function() {
					var run_time = new Date() - start_time
					//console.log('job '+job.name+' '+run_time+'ms '+EJSON.stringify(job.params))
					Jobqueue.remove(job._id)
					record_job_stat(job.name, run_time)
					self.is_busy = false
					self.process()
				})
			}
		}
	}

	this.start = function() {
		var self = this
		Meteor.setInterval(function() {
			self.process()
		}, self.timer_interval)
	}

	this.enqueue = function(name, params) {
		params = params || {}
		Jobqueue.upsert({
			name: name,
			params: params
		}, {
			$setOnInsert: {
				name: name,
				params: params,
				created_at: new Date()
			}
		})
	}
}

jobqueue.prototype.register = function(jobs) {
	for (var name in jobs) {
		this.jobs[name] = jobs[name]
	}
}

jobqueue.prototype.empty_queue = function() {
	Jobqueue.remove({})
}


if (Meteor.isServer) {
	worker = new jobqueue()

	worker.register({
		check_for_dominus: function(params, done) {
			check_for_dominus()
			done()
		},

		update_allies: function(params, done) {
			check(params.user_id, String)

			//update_allies(params.user_id)
			var rf = new relation_finder(params.user_id)
			rf.start()
			done()
		},

		// pass user_id
		update_networth: function(params, done) {
			check(params.user_id, String)

			update_networth(params.user_id)
			done()
		},

		// pass user_id
		update_losses_worth: function(params, done) {
			check(params.user_id, String)

			update_losses_worth(params.user_id)
			done()
		},

		// pass user, new_stats, add_to
		inc_daily_stats: function(params, done) {
			check(params.user_id, String)
			check(params.new_stats, Object)
			check(params.add_to, Boolean)

			inc_daily_stats(params.user_id, params.new_stats, params.add_to)
			done()
		},


		// pass type, quantity, buy
		update_market_price: function(params, done) {
			check(params.type, String)
			check(params.quantity, validNumber)
			check(params.buy, Boolean)

			update_market_price(params.type, params.quantity, params.buy)
			done()
		},

		record_market_history: function(params, done) {
			check(params.quantity, validNumber)

			record_market_history(params.quantity)
			done()
		},

		setupKingChatroom: function(params, done) {
			check(params.king_id, String)

			setupKingChatroom(params.king_id)
			done()
		},

		cleanupAllKingChatrooms: function(params, done) {
			cleanupAllKingChatrooms()
			done()
		},

		enemy_on_building_check: function(params, done) {
			enemy_on_building_check()
			done()
		},

		enemies_together_check: function(params, done) {
			enemies_together_check()
			done()
		}
	})
}
