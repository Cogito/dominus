var helpers = {
    title: function() {
        return "You have a new lord."
    },

    lord: function() {
        return AlertUsers.findOne(this.vars.lord_id)
    }
}

Template.alert_newLord.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_newLord.events = alertSharedEvents
Template.alert_newLord.rendered = alertSharedRendered

Template.alert_newLord.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            if (self.isOpen.get()) {
                Meteor.subscribe('alertUser', Template.currentData().vars.lord_id)
            }
        }
    })
}
