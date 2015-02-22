var helpers = {
    title: function() {
        return 'New hexes have been added to the map.'
    }
}


Template.ga_mapExpanded.helpers(_.extend(globalAlertSharedHelpers, helpers))
Template.ga_mapExpanded.events = alertSharedEvents
Template.ga_mapExpanded.rendered = alertSharedRendered


Template.ga_mapExpanded.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)
}
