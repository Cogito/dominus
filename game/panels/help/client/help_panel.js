Template.help_panel.helpers({
	s_resource_interval: function() {
		return moment.duration(s.resource.interval).humanize()
	},

	s_battle_interval: function() {
		return moment.duration(s.battle_interval).humanize()
	},

	resources_at_large_hexes: function() {
		return s.resource.large_resource_multiplier * s.resource.gained_at_hex
	}
})

Template.help_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}