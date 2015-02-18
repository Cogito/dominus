var helpers = {
    title: function() {
        return 'New hexes have been added to the map.'
    },

    isOpen: function() {
        return Template.instance().isOpen.get()
    }
}


Template.ga_mapExpanded.helpers(_.extend(globalAlertSharedHelpers, helpers))
Template.ga_mapExpanded.events = alertSharedEvents


Template.ga_mapExpanded.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)
}
