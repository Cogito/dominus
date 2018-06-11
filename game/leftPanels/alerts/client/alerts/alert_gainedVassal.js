var helpers = {
    title: function() {
        if (this) {
            var vassal = AlertUsers.findOne(this.vars.newVassalUser_id)
            if (vassal) {
                return vassal.username+' is now your vassal.'
            } else {
                return 'You have a new vassal.'
            }
        }        
    },

    vassal: function() {
        return AlertUsers.findOne(this.vars.newVassalUser_id)
    },

    vassalsLord: function() {
        if (this.vars.vassalsNewLord_id != Meteor.userId()) {
            return AlertUsers.findOne(this.vars.vassalsNewLord_id)
        }
    },

    lordTax: function() {
        return s.income.percentToLords * 100
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
                Meteor.subscribe('alertUser', Template.currentData().vars.vassalsNewLord_id)
            }

            Meteor.subscribe('alertUser', Template.currentData().vars.newVassalUser_id)
        }
    })
}
