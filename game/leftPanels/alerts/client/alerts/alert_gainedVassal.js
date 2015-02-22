var helpers = {
    title: function() {
        return 'You have a new vassal.'
    },

    vassal: function() {
        return AlertUsers.findOne(this.vars.newVassalUser_id)
    },

    vassalsLord: function() {
        if (this.vars.vassalsNewLord_id != Meteor.userId()) {
            return AlertUsers.findOne(this.vars.vassalsNewLord_id)
        }
    }
}

Template.alert_gainedVassal.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_gainedVassal.events = alertSharedEvents
Template.alert_gainedVassal.rendered = alertSharedRendered

Template.alert_gainedVassal.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            if (self.isOpen.get()) {
                Meteor.subscribe('alertUser', Template.currentData().vars.newVassalUser_id)
                Meteor.subscribe('alertUser', Template.currentData().vars.vassalsNewLord_id)
            }
        }
    })
}
