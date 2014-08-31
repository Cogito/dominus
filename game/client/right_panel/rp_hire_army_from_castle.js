Template.rp_hire_army_from_castle.helpers({
	is_owner: function() {
		if (this.user_id == Meteor.userId()) {
			return true
		} else {
			return false
		}
	},

	is_ally_below: function() {
		var res = Meteor.users.findOne(Meteor.userId(), {fields: {allies_below: 1}})
		if (res) {
			if (_.indexOf(res.allies_below, this.user_id) != -1) {
				return true
			}
		}
		return false
	},

	resource_cost: function() {
		return resource_cost_army(get_selected_hiring_units())
	},

	price: function() {
		return s.army.cost
	},

	stats: function() {
		return s.army.stats
	},

	num_units: function(type) {
		if (type) {
			return get_selected_hiring_unit(type)
		}
	},

	max_units: function(type) {
		if(type) {
			return get_hiring_max(type)
		}
	},

	cur_res: function(type) {
		if (type) {
			return round_number_1(get_hiring_current_resource(type))
		}
	},

	sel_cost: function(type) {
		if (type) {
			return round_number_1(get_hiring_cost(type))
		}
	},

	final_cost: function(type) {
		if (type) {
			return round_number_1(get_hiring_final_cost(type))
		}
	},

	is_gold: function(type) {
		if (type == 'gold') {
			return true
		} else {
			return false
		}
	},

	s_army: function() {
		return s.army
	}
})

Template.rp_hire_army_from_castle.events({
	'click #hire_army_from_castle_cancel_button': function(event, template) {
		Session.set('rp_template', 'rp_info_castle')
	},

	'click #hire_army_from_castle_hire_button': function(event, template) {
		if (no_units_are_selected()){
			$('#hire_zero_error').show(100)
		} else {
			var button = template.$('#hire_army_from_castle_hire_button')

			var button_html = button.html()
			button.attr('disabled', true)
			button.html('Please Wait')

			Meteor.call('hire_army', get_selected_hiring_units(), this._id, function(error, result) {
				if (result) {
					logevent('right_panel', 'complete', 'hire_army')
					Session.set('rp_template', 'rp_info_castle')
				} else {
					$('#hire_error').show(100)
					button.attr('disabled', false)
					button.html(button_html)
				}
			})
		}
	},

	'change .hire_units_new_slider, input .hire_units_new_slider': function(event, template) {
		var num = Number(event.currentTarget.value)
		set_selected_hiring_unit(this.toString(), num)
	},

	'click .sell_all_button': function(event, template) {
		var type = template.$(event.currentTarget).attr('data-type')
		var button = template.$(".sell_all_button[data-type='"+type+"']")

		var button_html = $(button).html()
		button.attr('disabled', true)
		button.html('Please Wait')
		Meteor.call('sell_resource', type, Meteor.user()[type], function(error, result) {
			button.attr('disabled', false)
			button.html(button_html)
		})
	}
})


Template.rp_hire_army_from_castle.rendered = function() {
	var self = this
	reset_selected_hiring_units()

	// current
	self.deps_set_current_resources = Deps.autorun(function() {
		var fields = {}
		_.each(s.resource.types_plus_gold, function(type) {
			fields[type] = 1
		})

		var user = Meteor.users.findOne(Meteor.userId(), {fields: fields})
		if (user && user.gold) {
			var current = {}
			_.each(s.resource.types_plus_gold, function(type) {
				current[type] = user[type]
			})

			set_hiring_current_resources(current)
		}
	})






	// compute slider max
	self.deps_compute_maxs = Deps.autorun(function() {

		_.each(s.army.types, function(type) {
			// get current market prices for loop
			var market = {}
			var m = Market.find({}, {fields: {price:1, type:1}})
			if (m && m.count() == s.resource.types.length) {
				m.forEach(function(res) {
					market[res.type] = res.price
				})
			} else {
				return false
			}

			// this will keep track of remaining resouces
			var remaining = get_hiring_current_resources()


			// subtract cost of selected units except this type
			var f = {}
			_.each(s.army.types, function(t) {
				if (t != type) {
					f[t] = get_selected_hiring_unit(t)
				}
			})

			// cost of selected army
			var c = resource_cost_army(f)

			// subtract from remaining
			// same as cost function
			_.each(s.resource.types, function(t) {
				var dif = c[t] - remaining[t]
				if (dif > 0) {
					remaining[t] = 0
					remaining.gold -= total_of_buy_quick(dif, market[t])
					// update market price
					market[t] = market[t] * Math.pow(s.market.increment + 1, dif)
					// if (remaining.gold < 0) {
					// 	console.log('WTF')		// <- how does this happen???
					// }
				} else {
					remaining[t] -= c[t]
				}
			})



			var max = 99999999999

			// only using resources
			_.each(s.resource.types, function(t) {
				var max_type = remaining[t] / s.army.cost[type][t]
				if (max_type < max) {
					max = max_type
				}
			})

			// get cost of max
			var a = {}
			a[type] = max
			var c = resource_cost_army(a)

			 // subtract cost from remaining
			 _.each(s.resource.types, function(t) {
			 	remaining[t] -= c[t]
			 })



			 // run loop until gold is gone
			 var has_gold_left = true
			 var num_can_buy = 0  	// start at 1, subtract 1 at end if can't buy any
			 while (has_gold_left) {
				num_can_buy++

				// set needed to 0
				// this is which resources we need to buy with gold to buy another army unit
				var needed = {}
				_.each(s.resource.types, function(t) {
					needed[t] = 0
				})

				// price for num_can_buy for this army type only
				var a = {}
				a[type] = num_can_buy
				var price = resource_cost_army(a)

				// find needed
				_.each(s.resource.types, function(t) {
					var n = price[t] - remaining[t]
					if (n > 0) {
						// we don't have enough cash, need more resources
						needed[t] = n
					}
				})

				// find gold for needed
				var needed_gold = 0
				_.each(s.resource.types, function(t) {
					if (needed[t] > 0) {
						needed_gold += total_of_buy_quick(needed[t], market[t])
					}
				})

				// do we not have enough gold?
				if (needed_gold > remaining.gold) {
					// we cannot buy, finish loop
					has_gold_left = false
					num_can_buy--
				}
			}

			set_hiring_max(type, Math.floor(max + num_can_buy))
		})
	})





	// cost
	self.deps_update_cost_on_selected_units_change = Deps.autorun(function() {
		var res_cost = resource_cost_army(get_selected_hiring_units())
		res_cost.gold = 0

		// get current market prices for loop
		// keep track because price will go up after each total_of_buy
		var market = {}
		var m = Market.find({}, {fields: {price:1, type:1}})
		if (m && m.count() == s.resource.types.length) {
			m.forEach(function(res) {
				market[res.type] = res.price
			})
		} else {
			return false
		}


		// check if final is below 0 for each resource
		_.each(s.resource.types, function(t) {
			var dif = res_cost[t] - get_hiring_current_resource(t)
			if (dif > 0) {
				// if it's below 0 then use gold to buy the rest
				res_cost[t] = get_hiring_current_resource(t)
				// get price
				var p = total_of_buy_quick(dif, market[t])
				// update market price
				market[t] = market[t] * Math.pow(s.market.increment + 1, dif)
				res_cost.gold += p
			}
		})

		set_hiring_costs(res_cost)
	})




	// clamp selected to max
	self.deps_clamp_to = Deps.autorun(function() {
		var max = get_hiring_maxs()
		var sel = get_selected_hiring_units()

		_.each(s.army.types, function(type) {
			if (sel[type] > max[type]) {
				set_selected_hiring_unit(type, max[type])
			}
		})
	})




	// final
	self.deps_set_final = Deps.autorun(function() {
		var final_costs = {}

		_.each(s.resource.types_plus_gold, function(type) {
			var current = get_hiring_current_resource(type)
			var cost = get_hiring_cost(type)
			final_costs[type] = current - cost
		})

		set_hiring_final_costs(final_costs)
	})


	// set slider max
	self.deps_update_slider_maxs = Deps.autorun(function() {
		_.each(get_hiring_maxs(), function(max, type) {
			check(max, Number)
			var new_slider = $('.hire_units_new_slider[data-type='+type+']')
			new_slider.attr('max', max)
			new_slider.attr('min', 0)
		})
	})

	logevent('right_panel', 'open', 'hire_army_from_castle')
}



Template.rp_hire_army_from_castle.destroyed = function() {
	var self = this

	if (self.deps_setSliderMax) {
		self.deps_setSliderMax.stop()
	}
	if (self.deps_set_current_resources) {
		self.deps_set_current_resources.stop()
	}
	if (self.deps_set_final) {
		self.deps_set_final.stop()
	}
	if (self.deps_update_cost_on_selected_units_change) {
		self.deps_update_cost_on_selected_units_change.stop()
	}
	if (self.deps_compute_maxs) {
		self.deps_compute_maxs.stop()
	}
	if (self.deps_update_slider_maxs) {
		self.deps_update_slider_maxs.stop()
	}
	if (self.deps_clamp_to_max) {
		self.deps_clamp_to_max.stop()
	}
}



/////////////////////////////////////////////////////////////////////////////
// getters and setters
/////////////////////////////////////////////////////////////////////////////

// max

var hiring_maxs = {}
_.each(s.army.types, function(type) {
	hiring_maxs[type] = 0
})
var hiring_maxs_dep = new Deps.Dependency

var get_hiring_maxs = function() {
	hiring_maxs_dep.depend()
	return clone_object(hiring_maxs)
}

var get_hiring_max = function(type) {
	check(type, String)

	hiring_maxs_dep.depend()
	return hiring_maxs[type]
}

var set_hiring_max = function(type, num) {
	check(type, String)
	check(num, Number)

	if (hiring_maxs[type] != num) {
		hiring_maxs[type] = num
		hiring_maxs_dep.changed()
	}
}

var set_hiring_maxs = function(army) {
	check(army, Object)
	var has_changed = false

	_.each(costs, function(value, key) {
		if (hiring_maxs[key] != value) {
			hiring_maxs[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		hiring_maxs_dep.changed()
	}
}





// final

var hiring_final_costs = {}
_.each(s.resource.types_plus_gold, function(type) {
	hiring_final_costs[type] = 0
})
var hiring_final_costs_dep = new Deps.Dependency

var get_hiring_final_costs = function() {
	hiring_final_costs_dep.depend()
	return clone_object(hiring_final_costs)
}

var get_hiring_final_cost = function(type) {
	check(type, String)

	hiring_final_costs_dep.depend()
	return hiring_final_costs[type]
}

var set_hiring_final_cost = function(type, num) {
	check(type, String)
	check(num, Number)

	if (hiring_final_costs[type] != num) {
		hiring_final_costs[type] = num
		hiring_final_costs_dep.changed()
	}
}

var set_hiring_final_costs = function(costs) {
	check(costs, Object)
	var has_changed = false

	_.each(costs, function(value, key) {
		if (hiring_final_costs[key] != value) {
			hiring_final_costs[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		hiring_final_costs_dep.changed()
	}
}






// costs for each army type

var hiring_army_costs = {}
_.each(s.army.types, function(type) {
	hiring_army_costs[type] = 0
})
var hiring_army_costs_dep = new Deps.Dependency

var get_hiring_army_costs = function() {
	hiring_army_costs_dep.depend()
	return clone_object(hiring_army_costs)
}

var get_hiring_army_cost = function(type) {
	check(type, String)

	hiring_army_costs_dep.depend()
	return hiring_army_costs[type]
}

var set_hiring_army_cost = function(type, num) {
	check(type, String)
	check(num, Number)

	if (hiring_army_costs[type] != num) {
		hiring_army_costs[type] = num
		hiring_army_costs_dep.changed()
	}
}

var set_hiring_army_costs = function(costs) {
	check(costs, Object)
	var has_changed = false

	_.each(costs, function(value, key) {
		if (hiring_army_costs[key] != value) {
			hiring_army_costs[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		hiring_army_costs_dep.changed()
	}
}






// costs

var hiring_costs = {}
_.each(s.resource.types_plus_gold, function(type) {
	hiring_costs[type] = 0
})
var hiring_costs_dep = new Deps.Dependency

var get_hiring_costs = function() {
	hiring_costs_dep.depend()
	return clone_object(hiring_costs)
}

var get_hiring_cost = function(type) {
	check(type, String)

	hiring_costs_dep.depend()
	return hiring_costs[type]
}

var set_hiring_cost = function(type, num) {
	check(type, String)
	check(num, Number)

	if (hiring_costs[type] != num) {
		hiring_costs[type] = num
		hiring_costs_dep.changed()
	}
}

var set_hiring_costs = function(costs) {
	check(costs, Object)
	var has_changed = false

	_.each(costs, function(value, key) {
		if (hiring_costs[key] != value) {
			hiring_costs[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		hiring_costs_dep.changed()
	}
}




// users current resources

var hiring_current_resources = {}
_.each(s.resource.types_plus_gold, function(type) {
	hiring_current_resources[type] = 0
})
var hiring_current_resources_dep = new Deps.Dependency

var get_hiring_current_resources = function() {
	hiring_current_resources_dep.depend()
	return clone_object(hiring_current_resources)
}

var get_hiring_current_resource = function(type) {
	check(type, String)

	hiring_current_resources_dep.depend()
	return hiring_current_resources[type]
}

var set_hiring_current_resource = function(type, num) {
	check(type, String)
	check(num, Number)

	if (hiring_current_resources[type] != num) {
		hiring_current_resources[type] = num
		hiring_current_resources_dep.changed()
	}
}

var set_hiring_current_resources = function(resources) {
	var has_changed = false

	_.each(resources, function(value, key) {
		if (hiring_current_resources[key] != value) {
			hiring_current_resources[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		hiring_current_resources_dep.changed()
	}
}





// selected units

var selected_hiring_units = {}
_.each(s.army.types, function(type) {
	selected_hiring_units[type] = 0
})
var selected_hiring_units_dep = new Deps.Dependency

var get_selected_hiring_units = function() {
	selected_hiring_units_dep.depend()
	return clone_object(selected_hiring_units)
}

var get_selected_hiring_unit = function(type) {
	check(type, String)
	selected_hiring_units_dep.depend()
	return selected_hiring_units[type]
}

var set_selected_hiring_unit = function(type, num) {
	check(type, String)
	check(num, Number)

	if (selected_hiring_units[type] != num) {
		selected_hiring_units_dep.changed()
		selected_hiring_units[type] = num
	}
}

var set_selected_hiring_units = function(army) {
	var has_changed = false

	_.each(army, function(value, key) {
		if (selected_hiring_units[key] != value) {
			selected_hiring_units[key] = value
			has_changed = true
		}
	})

	if (has_changed) {
		selected_hiring_units_dep.changed()
	}
}

var reset_selected_hiring_units = function() {
	var set = {}
	_.each(s.army.types, function(type) {
		set[type] = 0
	})
	set_selected_hiring_units(set)
}

var no_units_are_selected = function() {
	var has_no_units = true
	_.each(s.army.types, function(type) {
		if (selected_hiring_units[type] > 0) {
			has_no_units = false
		}
	})
	return has_no_units
}
