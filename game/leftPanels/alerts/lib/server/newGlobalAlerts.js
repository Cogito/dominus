gAlert_nameChange = function(user_id, previousName) {
    check(user_id, String)
    check(previousName, String)

    var vars = {user_id:user_id, previousName:previousName}
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


// --------


var newGlobalAlert = function(alertType, vars) {
    check(alertType, String)

    GlobalAlerts.insert({
        created_at: new Date(),
        type: alertType,
        vars: vars
    })
}
