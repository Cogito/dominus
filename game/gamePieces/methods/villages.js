Meteor.methods({
    upgradeVillage: function(villageId) {
        // get village
        var village = Villages.findOne({_id:villageId, user_id:Meteor.userId()})

        if (!village) {
            throw new Meteor.Error('No village found.')
        }

        // get user
        var userFields = {}
        _.each(s.resource.types, function(type) {
            userFields[type] = 1
        })
        var user = Meteor.users.findOne(Meteor.userId(), {fields:userFields})
        if (!user) {
            throw new Meteor.Error('No user found.')
        }

        // village not already at max level
        if (village.level >= s.village.maxLevel) {
            throw new Meteor.Error('Village at max level.')
        }

        // village not under construction
        if (village.under_construction) {
            throw new Meteor.Error('Cannot upgrade village while under construction.')
        }

        // does user have enough
        var hasEnough = true
        _.each(s.resource.types, function(type) {
            if (user[type] < s.village.cost['level'+(village.level+1)][type]) {
                hasEnough = false
            }
        })

        if (!hasEnough) {
            throw new Meteor.Error('Not enough resources.')
        }

        // passed tests, set under construction flag to true
        Villages.update(villageId, {$set:{under_construction:true, constructionStarted:new Date()}})

        return true
    },
})
