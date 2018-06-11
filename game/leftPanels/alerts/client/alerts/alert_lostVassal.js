var helpers = {
    title: function() {
        if (this) {
            var vassal = AlertUsers.findOne(this.vars.lostVassalUser_id)
            if (vassal) {
                return vassal.username+' is no longer your vassal.'
            } else {
                return "You've lost a vassal."
            }
        }
    },

    vassal: function() {
        return AlertUsers.findOne(this.vars.lostVassalUser_id)
    },

    vassalsLord: function() {
        return AlertUsers.findOne(this.vars.vassalsNewLord_id)
    }
}

Template.alert_lostVassal.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_lostVassal.events = alertSharedEvents
Template.alert_lostVassal.rendered = alertSharedRendered

Template.alert_lostVassal.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            if (self.isOpen.get()) {
                Meteor.subscribe('alertUser', Template.currentData().vars.vassalsNewLord_id)
            }
            Meteor.subscribe('alertUser', Template.currentData().vars.lostVassalUser_id)
        }
    })
}
