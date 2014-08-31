Template.help_panel.helpers({
	s_resource: function() {
		return s.resource
	},

	s_resource_interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	s_village: function() {
		return s.village
	},

	s_army: function() {
		return s.army
	}
})

Template.help_panel.rendered = function() {
	logevent('panel', 'open', 'help')
}