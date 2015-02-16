Template.alerts_battles.helpers({
    battles: function() {
        return AlertBattleTitles.find({isOver:false}, {sort:{created_at:-1}})
    },

    finishedBattles: function() {
        return AlertBattleTitles.find({isOver:true}, {sort:{created_at:-1}})
    }
})

Template.alerts_battles.created = function() {
    var self = this

    self.autorun(function() {
        Meteor.subscribe('battleAlertTitles')
    })
}
