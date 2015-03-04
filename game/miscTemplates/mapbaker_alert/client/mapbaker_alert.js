Template.mapbaker_alert.helpers({
    show: function() {
        var started = Settings.findOne({name:'mapBakeImagesStarted'})
        var finished = Settings.findOne({name:'mapBakeImagesFinished'})
        if (started && finished) {
            if (started.value - finished.value > 0) {
                return true
            }
        }
    },

    started: function() {
        var res = Settings.findOne({name:'mapBakeImagesStarted'})
        if (res) {
            return res.value
        }
    },

    finished: function() {
        var res = Settings.findOne({name:'mapBakeImagesFinished'})
        if (res) {
            return res.value
        }
    }
})


Template.mapbaker_alert.created = function() {
    var self = this

    self.subs = new ReadyManager()

    self.autorun(function() {
        self.subs.subscriptions([{
            groupName: 'counts',
            subscriptions: [ Meteor.subscribe('mapbakerCounts').ready() ]
        }])
    })
}
