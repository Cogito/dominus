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
			})

			dailystats.forEach(function(stat) {
				_.each(s.resource.types_plus_gold, function(type) {

					if (stat.hasOwnProperty('inc') && stat.inc.hasOwnProperty(type) && !isNaN(stat.inc[type])) {
						var y = stat.inc[type]
						inc[type].push({x:stat.updated_at, y:y})
					}

					if (stat.hasOwnProperty('vassalInc') && stat.vassalInc.hasOwnProperty(type) && !isNaN(stat.vassalInc[type])) {
						var y = stat.vassalInc[type]
						vInc[type].push({x:stat.updated_at, y:y})
					}

					if (stat.hasOwnProperty('inc') && stat.inc.hasOwnProperty('type') && !isNaN(stat.inc[type])) {
						var y = stat.inc[type] - stat.vassalInc[type]
						bInc[type].push({x:stat.updated_at, y:y})
					}
				})

				if (stat.hasOwnProperty('networth') && !isNaN(stat.networth)) {
					networthValues.push({x:stat.updated_at, y:stat.networth})
				}

				if (stat.hasOwnProperty('incomeRank') && !isNaN(stat.incomeRank)) {
					incomeRankValues.push({x:stat.updated_at, y:stat.incomeRank})
				}

				if (stat.hasOwnProperty('num_allies') && !isNaN(stat.num_allies)) {
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
				.yDomain([d3.max(incomeRankValues, function(d) { return d.y }),1])
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

			var numUsers = []
			var numActiveUsers = []

			var soldierWorth = {}
			_.each(s.army.types, function(type) {
				soldierWorth[type] = []
			})

			gamestats.forEach(function(stat) {
				if (stat.num_users && !isNaN(stat.num_users)) {
					numUsers.push({x:stat.created_at, y:stat.num_users})
				}

				if (stat.num_active_users && !isNaN(stat.num_active_users)) {
					numActiveUsers.push({x:stat.created_at, y:stat.num_active_users})
				}

				if (stat.soldierWorth) {
					_.each(s.army.types, function(type) {
						if (!isNaN(stat.soldierWorth[type])) {
							soldierWorth[type].push({x:stat.created_at, y:stat.soldierWorth[type]})
						}
					})
				}
			})

			var user_data = [
				{values: numUsers, key: 'Total Players', color: '#82d957'},
				{values: numActiveUsers, key: 'Active Players', color: '#5793d9'}
			]

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				.yDomain([0, d3.max(numUsers, function(d) { return d.y })])
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))
				d3.select('#users_chart svg').datum(user_data).transition().duration(300).call(chart)
				nv.utils.windowResize(chart.update)
				return chart
			})



			// soldier worth
			var soldierColors = [
				'#e6d545',
				'#82d957',
				'#d9d9d9',
				'#d9cf82',
				'#d98659',
				'#5793d9'
			]
			var soldierWorthData = []
			var x = 0
			_.each(s.army.types, function(type) {
				soldierWorthData.push({
					values: soldierWorth[type],
					key: type,
					color: soldierColors[x]
				})
				x++
			})

			nv.addGraph(function() {
				var chart = nv.models.lineChart().useInteractiveGuideline(true).showLegend(true).showYAxis(true).showXAxis(true)
				chart.xAxis.tickFormat(function(d) { return d3.time.format('%b %d')(new Date(d)); })
				chart.yAxis.tickFormat(d3.format(",.0f"))
				d3.select('#soldierWorthChart svg').datum(soldierWorthData).transition().duration(300).call(chart)
				nv.utils.windowResize(chart.update)
				return chart
			})

		}
	})
}
