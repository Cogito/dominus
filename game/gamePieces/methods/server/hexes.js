Meteor.methods({

    doesHexExist: function(x,y) {
        return Hexes.find({x:x, y:y}).count() == 1
    },
})
