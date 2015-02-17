var helpers = {
    battle: function() {
        if (this) {
            return Battles.findOne(this.vars.battle_id)
        }
    },

    title: function() {
        if (this) {
            switch(this.vars.type) {
                case 'castle':
                    return 'Your castle is under attack.'
                    break;
                case 'village':
                    return 'Your village is under attack.'
                    break;
                case 'army':
                    return 'Your army is in a battle.'
                    break;
            }
        }
    }
}

Template.alert_battleStart.helpers(_.extend(alertSharedHelpers, helpers))
Template.alert_battleStart.events = alertSharedEvents

Template.alert_battleStart.created = function() {
    var self = this

    self.isOpen = new ReactiveVar(false)

    self.autorun(function() {
        if (Template.currentData()) {
            Meteor.subscribe('battle', Template.currentData().vars.battle_id)
        }
    })
}
