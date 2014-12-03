Template.stats_panel.created = function() {
	var self = this

	// subscribe
	self.subReady = new ReactiveVar(false)
	this.autorun(function() {
		self.subReady.set(Meteor.subscribe('my_dailystats').ready() && Meteor.subscribe('stats_gamestats').ready())
	})
}


Template.stats_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation

	this.autorun(function() {
		if (Template.instance().subReady.get()) {
			var dailystats = Dailystats.find({user_id: Meteor.userId()}, {sort: {created_at: 1}})

			var i_gold = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.gold }
			})

			var i_grain = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.grain }
			})

			var i_lumber = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.lumber }
			})

			var i_ore = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.ore }
			})

			var i_wool = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.wool }
			})

			var i_clay = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.clay }
			})

			var i_glass = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.income.glass }
			})

			if (i_gold.length > 0 && i_grain.length > 0 && i_lumber.length > 0 && i_ore.length > 0 && i_wool.length > 0 && i_clay.length > 0 && i_glass.length > 0) {
				var income_data = [
					{values: i_gold, key: 'Gold', color: '#e6d545'},
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
					chart.yAxis.tickFormat(d3.format(",.0f"))

					d3.select('#income_chart svg').datum(income_data).transition().duration(300).call(chart)

					//nv.utils.windowResize(chart.update)

					//d3.selectAll("rect").style("opacity", 0.3)

					return chart
				})
			}





			var vi_gold = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.gold }
			})

			var vi_grain = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.grain }
			})

			var vi_lumber = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.lumber }
			})

			var vi_ore = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.ore }
			})

			var vi_wool = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.wool }
			})

			var vi_clay = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.clay }
			})

			var vi_glass = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.vassal_income.glass }
			})

			if (vi_gold.length > 0 && vi_grain.length > 0 && vi_lumber.length > 0 && vi_ore.length > 0 && vi_wool.length > 0 && vi_clay.length > 0 && vi_glass.length > 0) {
				var vassal_income_data = [
					{values: vi_gold, key: 'Gold', color: '#e6d545'},
					{values: vi_grain, key: 'Grain', color: '#82d957'},
					{values: vi_lumber, key: 'Lumber', color: '#b3823e'},
					{values: vi_ore, key: 'Ore', color: '#d9d9d9'},
					{values: vi_wool, key: 'Wool', color: '#d9cf82'},
					{values: vi_clay, key: 'Clay', color: '#d98659'},
					{values: vi_glass, key: 'Glass', color: '#5793d9'},
				]

				nv.addGraph(function() {
					var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

					chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
					chart.yAxis.tickFormat(d3.format(",.0f"))

					d3.select('#vassal_income_chart svg').datum(vassal_income_data).transition().duration(300).call(chart)

					nv.utils.windowResize(chart.update)

					//d3.selectAll("rect").style("opacity", 0.3)

					return chart
				})
			}






			var nw = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.networth }
			})

			if (nw.length > 0) {
				var networth_data = [
					{values: nw, key: 'Networth', color: '#e6d545'},
				]

				nv.addGraph(function() {
					var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

					chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
					chart.yAxis.tickFormat(d3.format(",.0f"))

					d3.select('#networth_chart svg').datum(networth_data).transition().duration(300).call(chart)

					nv.utils.windowResize(chart.update)

					return chart
				})
			}




			var nw = dailystats.map(function(value, index) {
				return {x: value.created_at, y:value.num_allies }
			})

			if (nw.length > 0) {
				var num_allies_data = [
					{values: nw, key: 'Vassals', color: '#5793d9'},
				]

				nv.addGraph(function() {
					var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

					chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
					chart.yAxis.tickFormat(d3.format(",.0f"))

					d3.select('#num_allies_chart svg').datum(num_allies_data).transition().duration(300).call(chart)

					nv.utils.windowResize(chart.update)

					return chart
				})
			}
		}
	})


	this.autorun(function() {
		if (Template.instance().subReady.get()) {
			var gamestats = Gamestats.find()

			var num_users = gamestats.map(function(value, index) {
				return {x: value.created_at, y:value.num_users }
			})

			var num_active_users = gamestats.map(function(value, index) {
				return {x: value.created_at, y:value.num_active_users }
			})

			if (num_users.length > 0 && num_active_users.length > 0) {
				var user_data = [
					{values: num_users, key: 'Players', color: '#82d957'},
					{values: num_active_users, key: 'Active Players', color: '#5793d9'}
				]

				nv.addGraph(function() {
					var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

					chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
					chart.yAxis.tickFormat(d3.format(",.0f"))

					d3.select('#users_chart svg').datum(user_data).transition().duration(300).call(chart)

					nv.utils.windowResize(chart.update)

					return chart
				})
			}

		}
	})
}