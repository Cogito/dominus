Template.help_panel.helpers({
	s_resource_interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	s_battle_interval: function() {
		return moment.duration(s.battle_interval).humanize()
	}
})

Template.help_panel.rendered = function() {
	logevent('panel', 'open', 'help')
}