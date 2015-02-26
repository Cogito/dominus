Meteor.methods({

    getUnitLocationBonusMultiplier: function(unit, type) {
        this.unblock()
        return getUnitLocationBonusMultiplier(unit, type)
    }
})
