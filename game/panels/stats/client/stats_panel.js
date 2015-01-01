var subs = new ReadyManager()

Template.stats_panel.created = function() {
	this.autorun(function() {
		subs.subscriptions([{
			groupName:'stats',
			subscriptions: [
				Meteor.subscribe('my_dailystats').ready(),
				Meteor.subscribe('stats_gamestats').ready()
				]
		}])
	})
}


Template.stats_panel.rendered = function() {
	var self = this

	this.firstNode.parentNode._uihooks = leftPanelAnimation

	this.autorun(function() {
		if (subs.ready('stats')) {
			var dailystats = Dailystats.find({user_id: Meteor.userId()}, {sort: {created_at: 1}})

			// old, remove these two soon
			var income = {}			// income
			var vassalIncome = {}	// vassal income

			var inc = {}	// total income
			var vInc = {}	// vassal income
			var bInc = {}	// income from castle/villages

			var networthValues = []
			var incomeRankValues = []
			var numVassalsValues = []

			_.each(s.resource.types_plus_gold, function(type) {
				inc[type] = []
				vInc[type] = []
				bInc[type] = []
				income[type] = []
				vassalIncome[type] = []
			})

			dailystats.forEach(function(stat) {
				_.each(s.resource.types_plus_gold, function(type) {

					if (stat.inc && stat.inc[type] && !isNaN(stat.inc[type])) {
						var y = stat.inc[type]
						inc[type].push({x:stat.updated_at, y:y})
					}

					if (stat.vassalInc && stat.vassalInc[type] && !isNaN(stat.vassalInc[type])) {
						var y = stat.vassalInc[type]
						vInc[type].push({x:stat.updated_at, y:y})
					}

					if (stat.inc && stat.vassalInc && stat.inc[type] && stat.vassalInc[type] && !isNaN(stat.vassalInc[type]) && !isNaN(stat.inc[type])) {
						var y = stat.inc[type] - stat.vassalInc[type]
						bInc[type].push({x:stat.updated_at, y:y})
					}

					if (stat.income && stat.income[type] && !isNaN(stat.income[type])) {
						var y = stat.income[type]
						income[type].push({x:stat.updated_at, y:y})
					}

					if (stat.vassal_income && stat.vassal_income[type] && !isNaN(stat.vassal_income[type])) {
						var y = stat.vassal_income[type]
						vassalIncome[type].push({x:stat.updated_at, y:y})
					}
				})

				if (stat.networth && !isNaN(stat.networth)) {
					networthValues.push({x:stat.updated_at, y:stat.networth})
				}

				if (stat.incomeRank && !isNaN(stat.incomeRank)) {
					incomeRankValues.push({x:stat.updated_at, y:stat.incomeRank})
				}

				if (stat.num_allies && !isNaN(stat.num_allies)) {
					numVassalsValues.push({x:stat.updated_at, y:stat.num_allies})
				}

			})


			var incData = [
				{values: inc.gold, key: 'Gold', color: '#e6d545'},
				{values: inc.grain, key: 'Grain', color: '#82d957'},
				{values: inc.lumber, key: 'Lumber', color: '#b3823e'},
				{values: inc.ore, key: 'Ore', color: '#d9d9d9'},
				{values: inc.wool, key: 'Wool', color: '#d9cf82'},
				{values: inc.clay, key: 'Clay', color: '#d98659'},
				{values: inc.glass, key: 'Glass', color: '#5793d9'},
				]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#incChart svg').datum(incData).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})



			var bIncData = [
				{values: bInc.gold, key: 'Gold', color: '#e6d545'},
				{values: bInc.grain, key: 'Grain', color: '#82d957'},
				{values: bInc.lumber, key: 'Lumber', color: '#b3823e'},
				{values: bInc.ore, key: 'Ore', color: '#d9d9d9'},
				{values: bInc.wool, key: 'Wool', color: '#d9cf82'},
				{values: bInc.clay, key: 'Clay', color: '#d98659'},
				{values: bInc.glass, key: 'Glass', color: '#5793d9'},
				]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#buildingIncChart svg').datum(bIncData).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})



			var vIncData = [
				{values: vInc.gold, key: 'Gold', color: '#e6d545'},
				{values: vInc.grain, key: 'Grain', color: '#82d957'},
				{values: vInc.lumber, key: 'Lumber', color: '#b3823e'},
				{values: vInc.ore, key: 'Ore', color: '#d9d9d9'},
				{values: vInc.wool, key: 'Wool', color: '#d9cf82'},
				{values: vInc.clay, key: 'Clay', color: '#d98659'},
				{values: vInc.glass, key: 'Glass', color: '#5793d9'},
				]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#vassalIncChart svg').datum(vIncData).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})






			var income_data = [
				{values: income.gold, key: 'Gold', color: '#e6d545'},
				{values: income.grain, key: 'Grain', color: '#82d957'},
				{values: income.lumber, key: 'Lumber', color: '#b3823e'},
				{values: income.ore, key: 'Ore', color: '#d9d9d9'},
				{values: income.wool, key: 'Wool', color: '#d9cf82'},
				{values: income.clay, key: 'Clay', color: '#d98659'},
				{values: income.glass, key: 'Glass', color: '#5793d9'},
			]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#income_chart svg').datum(income_data).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})




			var vassal_income_data = [
				{values: vassalIncome.gold, key: 'Gold', color: '#e6d545'},
				{values: vassalIncome.grain, key: 'Grain', color: '#82d957'},
				{values: vassalIncome.lumber, key: 'Lumber', color: '#b3823e'},
				{values: vassalIncome.ore, key: 'Ore', color: '#d9d9d9'},
				{values: vassalIncome.wool, key: 'Wool', color: '#d9cf82'},
				{values: vassalIncome.clay, key: 'Clay', color: '#d98659'},
				{values: vassalIncome.glass, key: 'Glass', color: '#5793d9'},
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







			var networth_data = [
			{values: networthValues, key: 'Networth', color: '#e6d545'},
			]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#networth_chart svg').datum(networth_data).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})



			var incomeRankData = [{values: incomeRankValues, key: 'Income Rank', color: '#e6d545'}]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)

				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))

				d3.select('#rankIncomeChart svg').datum(incomeRankData).transition().duration(300).call(chart)

				nv.utils.windowResize(chart.update)

				return chart
			})





			var num_allies_data = [
			{values: numVassalsValues, key: 'Vassals', color: '#5793d9'},
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
	})


	this.autorun(function() {
		if (subs.ready('stats')) {
			var gamestats = Gamestats.find({}, {sort:{created_at:1}})

			var num_users = gamestats.map(function(value, index) {
				return {x: value.created_at, y:value.num_users }
			})

			var num_active_users = gamestats.map(function(value, index) {
				return {x: value.created_at, y:value.num_active_users }
			})

			if (num_users.length > 0 && num_active_users.length > 0) {
				var user_data = [
					{values: num_users, key: 'Total Players', color: '#82d957'},
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
