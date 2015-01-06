Template.adminNotificationCounts.helpers({
    counts: function() {
        var nots = Notifications.find().fetch()
        var groupedTypes = _.groupBy(_.pluck(nots, 'type'))
        var counts = []
        _.each(_.values(groupedTypes), function(type) {
            counts.push({type:type[0], num:type.length})
        })
        counts = _.sortBy(counts, function(c) {
            return c.num * -1
        })
        return counts
    }
})
