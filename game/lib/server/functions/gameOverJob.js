Cue.addJob('checkForGameOver', {retryOnError:false, maxMs:1000*60*5}, function(task, done) {
    checkForGameOver()
    done()
})

checkForGameOver = function() {
    var end = Settings.findOne({name: 'gameEndDate'})
    if (end && end.value != null) {
        var endDate = moment(end.value)
        if (endDate) {
            if (moment().isAfter(endDate)) {

                // has alert already been sent
                var hasBeenSent = Settings.findOne({name:'hasGameOverAlertBeenSent'})
                if (!hasBeenSent || !hasBeenSent.value) {

                    // find who won
                    var winner = Meteor.users.findOne({is_dominus:true}, {fields:{_id:1}})
                    if (!winner) {

                        // if nobody is currently dominus see who was last dominus
                        var lastDominus = Settings.findOne({name: 'lastDominusUserId'})
                        if (lastDominus && lastDominus.value) {
                            winner = Meteor.users.findOne(lastDominus.value, {fields:{_id:1}})
                        }
                    }

                    if (winner) {
                        gAlert_gameOver(winner._id)
                        Settings.upsert({name: 'hasGameOverAlertBeenSent'}, {$set: {name: 'hasGameOverAlertBeenSent', value:true}})
                        Settings.upsert({name: 'isGameOver'}, {$set: {name: 'isGameOver', value:true}})

                    } else {
                        console.error('Game is over but no dominus found.')
                    }


                }
            }
        }
    }
}
