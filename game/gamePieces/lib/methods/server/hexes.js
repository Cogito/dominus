Meteor.methods({
    generate_hexes: function(num_of_rings) {
        if (get_user_property("admin")) {
            generate_hexes(num_of_rings)
        }
    },

    getWorthOfHex: function(x, y) {
        var r = resourcesFromSurroundingHexes(x, y, s.resource.num_rings_village)
        var worth = resources_to_gold(r.grain, r.lumber, r.ore, r.wool, r.clay, r.glass)
        return worth
    },

    doesHexExist: function(x,y) {
        return Hexes.find({x:x, y:y}).count() == 1
    },
})
