Template.rp_village_upgrade.helpers({
    upgradeTime: function() {
        var village = Template.instance().villageData.get()
        if (village && village.level) {
            var ms = s.village.cost['level'+(village.level+1)].timeToBuild
            var duration = moment.duration(ms)
            return duration.humanize()
        }
    },

    upgradeText: function() {
        var village = Template.instance().villageData.get()
        if (village && village.level) {
            switch (village.level) {
                case 1:
                    var text = 'Upgrading to level 2 increases village production bonus to '+s.village.productionBonus.level2+'x and enables the hiring of archers and pikemen.'
                    break;
                case 2:
                    var text = 'Upgrading to level 3 increases village production bonus to '+s.village.productionBonus.level3+'x and enables the hiring of all soldiers except catapults.'
                    break;
            }

            return text
        }
    },

    // get number of each type the village costs
    cost: function(type) {
        var village = Template.instance().villageData.get()
        if (village && village.level) {
            return s.village.cost['level'+(village.level+1)][type]
        }
    },

    // only show row in table if the cost for this resource type is greater than zero
    // hide if resource is not required to upgrade village
    costGreaterThanZero: function(type) {
        var village = Template.instance().villageData.get()
        if (village && village.level) {
            if (s.village.cost['level'+(village.level+1)][type] > 0) {
                return true
            }
        }
    },

    // does user have enough of this type to upgrade village
    hasEnoughType: function(type) {
        var userFields = {}
        _.each(s.resource.types, function(type) {
            userFields[type] = 1
        })

        var user = Meteor.users.findOne(Meteor.userId(), {fields:userFields})
        if (user) {

            var village = Template.instance().villageData.get()
            if (village && village.level) {
                if (user[type] >= s.village.cost['level'+(village.level+1)][type]) {
                    return ''
                }
            }
        }

        return 'danger'
    },

    hasEnough: function() {
        var hasEnough = true

        var userFields = {}
        _.each(s.resource.types, function(type) {
            userFields[type] = 1
        })

        var user = Meteor.users.findOne(Meteor.userId(), {fields:userFields})
        if (user) {

            var village = Template.instance().villageData.get()
            if (village && village.level) {
                _.each(s.resource.types, function(type) {
                    if (user[type] < s.village.cost['level'+(village.level+1)][type]) {
                        hasEnough = false
                    }
                })

                if (!hasEnough) {
                    return 'disabled'
                }
            }
        }
    }
})


Template.rp_village_upgrade.events({
    'click #cancelButton': function(event, template) {
        Session.set('rp_template', 'rp_info_village')
    },

    'click #upgradeVillageButton': function(event, template) {
        var alert = template.find('#upgradeVillageAlert')
        var button = template.find('#upgradeVillageButton')
        var buttonText = $(button).html()

        $(alert).hide()
        $(button).html('Upgrading Village...')

        Meteor.call('upgradeVillage', template.data._id, function(error, result) {
            $(button).html(buttonText)
            if (error) {
                $(alert).html(error.error)
                $(alert).show(100)
            } else {
                Session.set('rp_template', 'rp_info_village')
            }
        })
    },
})


Template.rp_village_upgrade.created = function() {
    var self = this
    self.villageData = new ReactiveVar(null)

    self.autorun(function() {
        var village = RightPanelVillages.findOne(Session.get('selected_id'))
        if (village) {
            self.villageData.set(village)
        } else {
            self.villageData.set(null)
        }
    })
}
