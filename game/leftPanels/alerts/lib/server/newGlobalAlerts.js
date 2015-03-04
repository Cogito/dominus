gAlert_nameChange = function(user_id, previousName, newName) {
    check(user_id, String)
    check(previousName, String)
    check(newName, String)

    var vars = {user_id:user_id, previousName:previousName, newName:newName}
    newGlobalAlert('ga_nameChange', vars)
}

gAlert_sentGold = function(fromUser_id, toUser_id, amount) {
    check(fromUser_id, String)
    check(toUser_id, String)
    check(amount, validNumber)

    var vars = {fromUser_id:fromUser_id, toUser_id:toUser_id, amount:amount}
    newGlobalAlert('ga_sentGold', vars)
}


gAlert_sentArmy = function(fromUser_id, toUser_id, army) {
    check(fromUser_id, String)
    check(toUser_id, String)
    check(army, Object)

    var vars = {fromUser_id:fromUser_id, toUser_id:toUser_id, army:army}
    newGlobalAlert('ga_sentArmy', vars)
}


gAlert_mapExpanded = function(numHexes, numRings) {
    check(numHexes, validNumber)
    check(numRings, validNumber)
    var vars = {numHexes:numHexes, numRings:numRings}
    newGlobalAlert('ga_mapExpanded', vars)
}


gAlert_noLongerDominusNewUser = function(oldDominusUser_id) {
    check(oldDominusUser_id, String)
    var vars = {oldDominusUser_id:oldDominusUser_id}
    newGlobalAlert('ga_noLongerDominusNewUser', vars)
}


gAlert_newDominus = function(newDominusUser_id, previousDominusUser_id) {
    check(newDominusUser_id, String)
    check(previousDominusUser_id, Match.OneOf(null, String))
    var vars = {newDominusUser_id:newDominusUser_id, previousDominusUser_id:previousDominusUser_id}
    newGlobalAlert('ga_newDominus', vars)
}


gAlert_gameOver = function(winnerUser_id) {
    check(winnerUser_id, String)
    var vars = {winnerUser_id:winnerUser_id}
    newGlobalAlert('ga_gameOver', vars)
}


gAlert_accountDeleted = function(username) {
    check(username, String)
    var vars = {username:username}
    newGlobalAlert('ga_accountDeleted', vars)
}


gAlert_inactiveAccountDeleted = function(username) {
    check(username, String)
    var vars = {username:username}
    newGlobalAlert('ga_inactiveAccountDeleted', vars)
}


// --------


var newGlobalAlert = function(alertType, vars) {
    check(alertType, String)

    GlobalAlerts.insert({
        created_at: new Date(),
        type: alertType,
        vars: vars
    })
}
