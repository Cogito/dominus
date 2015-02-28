Meteor.startup(function() {
    if (process.env.DOMINUS_WORKER == 'true') {

        // for rankings
        // keep track of how many villages there are
        var countVillages = 0
        var initializingVillages = true

        var settingVillages = Settings.findOne({name:'villageCount'})
        if (!settingVillages) {
            var settingVillages = {name:'villageCount', value:0}
            settingVillages._id = Settings.insert(settingVillages)
        }

        var handleVillages = Villages.find().observeChanges({
            added: function(id) {
                countVillages++
                if (!initializingVillages) {
                    Settings.update(settingVillages._id, {$set: {value:countVillages}})
                }
            },

            removed: function(id) {
                countVillages--
                if (!initializingVillages) {
                    Settings.update(settingVillages._id, {$set: {value:countVillages}})
                }
            }
        })

        initializingVillages = false
        Settings.update(settingVillages._id, {$set: {value:countVillages}})




        // for rankings
        // keep track of how many players there are
        var countPlayers = 0
        var initializingPlayers = true

        var settingPlayers = Settings.findOne({name:'playerCount'})
        if (!settingPlayers) {
            var settingPlayers = {name:'playerCount', value:0}
            settingPlayers._id = Settings.insert(settingPlayers)
        }

        var handlePlayers = Meteor.users.find().observeChanges({
            added: function(id) {
                countPlayers++
                if (!initializingPlayers) {
                    Settings.update(settingPlayers._id, {$set: {value:countPlayers}})
                }
            },

            removed: function(id) {
                countPlayers--
                if (!initializingPlayers) {
                    Settings.update(settingPlayers._id, {$set: {value:countPlayers}})
                }
            }
        })
        initializingPlayers = false
        Settings.update(settingPlayers._id, {$set: {value:countPlayers}})

    }
})
