var helpers = {
    fromUser: function() {
        return AlertUsers.findOne(this.vars.fromUser_id)
    },

    toUser: function() {
        return AlertUsers.findOne(this.vars.toUser_id)
    },

    title: function() {
        var fromUser = AlertUsers.findOne(this.vars.fromUser_id)
        var toUser = AlertUsers.findOne(this.vars.toUser_id)
        if (toUser && fromUser) {
            return fromUser.username +' sent '+toUser.username+' an army.'
        }
    },

    numSoldiers: function() {
        var army = Template.parentData(1).vars.army
        return round_number(army[this])
    },

    hasSoldierType: function() {
        var army = Template.parentData(1).vars.army
        return army[this] > 0
    }
}


Template.ga_sentArmy.helpers(_.extend(globalAlertSharedHelpers, helpers))
Template.ga_sentArmy.events = alertSharedEvents
Template.ga_sentArmy.rendered = alertSharedRendered


Template.ga_sentArmy.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            Meteor.subscribe('alertUser', Template.currentData().vars.fromUser_id)
            Meteor.subscribe('alertUser', Template.currentData().vars.toUser_id)
        }
    })
}
