var fields = {x:1,y:1,castle_id:1,income:1, networth:1, username:1}

var findVassals = function(user_id) {
    var vassals = []
    Meteor.users.find({lord:user_id}, {fields:fields}).forEach(function(user) {
        user.vassals = findVassals(user._id)
        vassals.push(user)
    })
    return vassals
}


generateTree = function() {
    var start_time = new Date()
    var tree = []

    Meteor.users.find({lord:null}, {fields:fields}).forEach(function(king) {
        king.vassals = findVassals(king._id)
        tree.push(king)
    })

    Settings.upsert({name: 'tree'}, {$set: {name:'tree', value:tree}})

    record_job_stat('generateTree', new Date() - start_time)
}
