Meteor.publish('mapbakerCounts', function() {
    var names = ['mapBakeImagesStarted', 'mapBakeImagesFinished']
    return Settings.find({name:{$in:names}})
})
