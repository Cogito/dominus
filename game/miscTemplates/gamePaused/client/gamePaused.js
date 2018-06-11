Template.gamePaused.helpers({
    show: function() {
        if (Template.instance().subscriptionsReady()) {
            var stopped = CueData.findOne({name:'stopped'})
            if (stopped) {
                return stopped.value
            }
        }
    }
})

Template.gamePaused.onCreated(function() {
    this.subscribe('cuePaused')
})
