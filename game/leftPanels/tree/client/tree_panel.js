var subs = new ReadyManager()

Template.tree_panel.helpers({
	tree: function() {
		return Settings.findOne({name:'tree'}).value
	}
})

Template.tree_panel.created = function() {
	this.autorun(function() {
		subs.subscriptions([{
			groupName:'tree',
			subscriptions: [
				Meteor.subscribe('cachedTree').ready()
			]
		}])
	})
}

Template.tree_panel.rendered = function() {
	this.firstNode.parentNode._uihooks = leftPanelAnimation
}
