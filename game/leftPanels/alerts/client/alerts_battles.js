Template.alerts_battles.helpers({
    battles: function() {
        return AlertBattleTitles.find({isOver:false}, {sort:{updated_at:-1}})
    },

    finishedBattles: function() {
        return AlertBattleTitles.find({isOver:true}, {sort:{updated_at:-1}})
    }
})

Template.alerts_battles.events({
    'click #showMoreButton': function() {
        Template.instance().numShow.set(Template.instance().numShow.get() + 5)
    }
})

Template.alerts_battles.created = function() {
    var self = this

    self.numShow = new ReactiveVar(10)

    self.autorun(function() {
        Meteor.subscribe('battleAlertTitles', Math.min(self.numShow.get(), 150))
    })
}
