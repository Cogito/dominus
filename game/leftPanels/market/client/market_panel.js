Template.market_panel.helpers({

	grain: function() {
		return Market.findOne({type: 'grain'}, {fields: {price: 1}})
	},

	lumber: function() {
		return Market.findOne({type: 'lumber'}, {fields: {price: 1}})
	},

	ore: function() {
		return Market.findOne({type: 'ore'}, {fields: {price: 1}})
	},

	wool: function() {
		return Market.findOne({type: 'wool'}, {fields: {price: 1}})
	},

	clay: function() {
		return Market.findOne({type: 'clay'}, {fields: {price: 1}})
	},

	glass: function() {
		return Market.findOne({type: 'glass'}, {fields: {price: 1}})
	},

	tax_precent: function() {
		return s.market.sell_tax * 100
	},

	disabled_buttons: function() {
		if (Session.get('temp_market_type') && Session.get('temp_market_quantity')) {
			var type = Session.get('temp_market_type')
			var quantity = Session.get('temp_market_quantity')
			if (quantity > 0 && type != '') {
				return false
			}
		}
		return true
	},

	disabled_max_buttons: function() {
		if (Session.get('temp_market_type') == '') {
			return true
		} else {
			return false
		}
	},

	subReady: function() {
		return Template.instance().subReady.get()
	}

})


Template.market_panel.events({
	'click #market_buy_button': function(event, template) {
		$('#market_error_alert').hide()
		$('#market_success_alert').hide()

		var type = $('input[name=market_type_radio]:checked').val()
		var quantity = Number($('#quantity_input').val())

		if (type) {
			var resource = Market.findOne({type: type})
			if (resource) {
				if (quantity <= 0) {
					$('#market_error_alert').text('Enter how many you want to buy.')
					$('#market_error_alert').show()
				} else {
					var cost = total_of_buy(type, quantity)
					if (cost <= get_user_property("gold")) {
						$('#market_success_alert').text('Buying resource.')
						$('#market_success_alert').show()

						var button_html = $('#market_buy_button').html()
						$('#market_buy_button').attr('disabled', true)
						$('#market_buy_button').html('Please Wait')

						Meteor.apply('buy_resource', [type, quantity], {wait: true, onResultReceived: function(error, result) {
							if (error) {
								$('#market_error_alert').text('Error')
								$('#market_success_alert').hide()
								$('#market_error_alert').show()
								$('#market_buy_button').attr('disabled', false)
								$('#market_buy_button').html(button_html)
							} else {
								if (result.result) {
									$('#market_success_alert').text('Bought '+quantity+' '+type+' for '+round_number_1(result.cost)+' gold.')
									$('#market_buy_button').attr('disabled', false)
									$('#market_buy_button').html(button_html)
								} else {
									$('#market_error_alert').text(result.reason)
									$('#market_success_alert').hide()
									$('#market_error_alert').show()
									$('#market_buy_button').attr('disabled', false)
									$('#market_buy_button').html(button_html)
								}
							}
						}})

					} else {
						$('#market_error_alert').text('You do not have enough gold.')
						$('#market_error_alert').show()
					}
				}
			}
		} else {
			$('#market_error_alert').text('Select which type you want to buy.')
			$('#market_error_alert').show()
		}
	},

	'click #market_sell_button': function(event, template) {
		$('#market_error_alert').hide()
		$('#market_success_alert').hide()

		var type = $('input[name=market_type_radio]:checked').val()
		var quantity = Number($('#quantity_input').val())

		if (type) {
			var resource = Market.findOne({type: type})
			if (resource) {
				if (quantity <= 0) {
					$('#market_error_alert').text('Enter how many you want to sell.')
					$('#market_error_alert').show()
				} else {
					if (Meteor.user()[type] >= quantity) {
						$('#market_success_alert').text('Selling resource.')
						$('#market_success_alert').show()

						var button_html = $('#market_sell_button').html()
						$('#market_sell_button').attr('disabled', true)
						$('#market_sell_button').html('Please Wait')

						Meteor.apply('sell_resource', [type, quantity], {wait: true, onResultReceived: function(error, result) {
							if (error) {
								$('#market_error_alert').text('Error')
								$('#market_success_alert').hide()
								$('#market_error_alert').show()
								$('#market_sell_button').attr('disabled', false)
								$('#market_sell_button').html(button_html)
							} else {
								if (result.result) {
									$('#market_success_alert').text('Sold '+quantity+' '+type+' for '+round_number_1(result.total)+' gold.')
									$('#market_sell_button').attr('disabled', false)
									$('#market_sell_button').html(button_html)
								} else {
									$('#market_error_alert').text('Unable to sell resource.')
									$('#market_success_alert').hide()
									$('#market_error_alert').show()
									$('#market_sell_button').attr('disabled', false)
									$('#market_sell_button').html(button_html)
								}
							}
						}})
					} else {
						$('#market_error_alert').text('You do not have enough '+type+'.')
						$('#market_error_alert').show()
					}
				}
			}
		} else {
			$('#market_error_alert').text('Select which type you want to sell.')
			$('#market_error_alert').show()
		}
	},

	'keyup #quantity_input': function(event, template) {
		var input = $('#quantity_input').val()
		if (isNaN(parseFloat(input))) {
			$('#quantity_input').val( input.replace(/[^0-9\.]/g,'') )
			Session.set('temp_market_quantity', Number($('#quantity_input').val()))
		}
	},

	'input #quantity_input': function(event, template) {
		Session.set('temp_market_quantity', Number($('#quantity_input').val()))
	},

	'change input[name=market_type_radio]': function(event, template) {
		Session.set('temp_market_type', $('input[name=market_type_radio]:checked').val())
	},

	'click #max_sell_button': function(event, template) {
		var num = Meteor.user()[Session.get('temp_market_type')]
		num = Math.floor(num)
		$('#quantity_input').val(num)
		Session.set('temp_market_quantity', num)
	},

	'click #max_buy_button': function(event, template) {
		var type = Session.get('temp_market_type')
		var resource = Market.findOne({type: type})
		if (resource) {
			var num = max_buy(get_user_property("gold"), resource.price)
			$('#quantity_input').val(num)
			Session.set('temp_market_quantity', num)
		}
	}
})


Template.market_panel.destroyed = function() {
	if (this.deps_preview) {
		this.deps_preview.stop()
	}
	if (this.deps_subscribeMarket) {
		this.deps_subscribeMarket.stop()
	}
	if (this.deps_marketCharts) {
		this.deps_marketCharts.stop()
	}
}


Template.market_panel.created = function() {
	var self = this

	Session.set('temp_market_type', '')
	Session.set('temp_market_quantity', 0)

	// subscribe
	self.subReady = new ReactiveVar(false)
	self.autorun(function() {
		self.subReady.set(Meteor.subscribe('markethistory').ready())
	})
}


Template.market_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation

	this.autorun(function() {

		$('#market_preview_buy').text('')
		$('#market_preview_sell').text('')
		$('#market_preview_buy').css('color', '#fff')
		$('#market_preview_sell').css('color', '#fff')

		var type = Session.get('temp_market_type')
		var quantity = Session.get('temp_market_quantity')

		if (quantity > 0 && type != '') {
			var resource = Market.findOne({type: type})
			if (resource) {
				// buy
				var cost = total_of_buy(type, quantity)
				$('#market_preview_buy').text('Buy '+round_number_1(quantity)+' '+type+' for '+round_number_1(cost)+' gold.')
				if (cost > get_user_property("gold")) {
					$('#market_preview_buy').css('color', 'red')
				}

				if (Meteor.user()[type] < quantity) {
					$('#market_preview_sell').css('color', 'red')
					$('#market_preview_sell').text('Not enough available.')
				} else {
					var total = total_of_sell(type, quantity)
					$('#market_preview_sell').text('Sell '+round_number_1(quantity)+' '+type+' for '+round_number_1(total)+' gold.')
				}
			}
		}
	})




	// charts
	this.autorun(function() {
		if (Template.instance().subReady.get()) {
			var markethistory = Markethistory.find({}, {sort: {created_at: 1}})
			if (markethistory) {

				var i_grain = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.grain }
				})

				var i_lumber = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.lumber }
				})

				var i_ore = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.ore }
				})

				var i_wool = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.wool }
				})

				var i_clay = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.clay }
				})

				var i_glass = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.price.glass }
				})

				if (i_grain.length > 0 && i_lumber.length > 0 && i_ore.length > 0 && i_wool.length > 0 && i_clay.length > 0 && i_glass.length > 0) {
					var price_data = [
						{values: i_grain, key: 'Grain', color: '#82d957'},
						{values: i_lumber, key: 'Lumber', color: '#b3823e'},
						{values: i_ore, key: 'Ore', color: '#d9d9d9'},
						{values: i_wool, key: 'Wool', color: '#d9cf82'},
						{values: i_clay, key: 'Clay', color: '#d98659'},
						{values: i_glass, key: 'Glass', color: '#5793d9'},
					]

					nv.addGraph(function() {
						var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

						chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
						chart.yAxis.tickFormat(d3.format(",.2f"))

						d3.select('#market_price_chart svg').datum(price_data).transition().duration(300).call(chart)

						//nv.utils.windowResize(chart.update)

						return chart
					})
				}





				var vol = markethistory.map(function(value, index) {
					return {x: value.created_at, y:value.quantity }
				})

				if (i_grain.length > 0 && i_lumber.length > 0 && i_ore.length > 0 && i_wool.length > 0 && i_clay.length > 0 && i_glass.length > 0) {
					var volume_data = [
						{values: vol, key: 'Volume', color: '#5793d9'},
					]

					nv.addGraph(function() {
						var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

						chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
						chart.yAxis.tickFormat(d3.format(",.0f"))

						d3.select('#market_volume_chart svg').datum(volume_data).transition().duration(300).call(chart)

						nv.utils.windowResize(chart.update)

						return chart
					})
				}
			}

		}
	})
}
