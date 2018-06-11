Meteor.publish('cuePaused', function() {
    return CueData.find({name:'stopped'})
})
