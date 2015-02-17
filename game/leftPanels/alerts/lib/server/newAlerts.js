alert_battleStart = function(user_id, unit_id, type, battle_id) {
    check(user_id, String)
    check(unit_id, String)
    check(type, String)
    check(battle_id, String)

    var vars = {unit_id:unit_id, type:type, battle_id:battle_id}
    newAlert('alert_battleStart', [user_id], vars)
}


alert_receivedGoldFrom = function(user_id, fromUser_id, amount) {
    check(user_id, String)
    check(fromUser_id, String)
    check(amount, validNumber)

    var vars = {fromUser_id:fromUser_id, amount:amount}
    newAlert('alert_receivedGoldFrom', [user_id], vars)
}


alert_receivedArmy = function(user_id, fromUser_id, army) {
    check(user_id, String)
    check(fromUser_id, String)
    check(army, Object)

    var vars = {fromUser_id:fromUser_id, army:army}
    newAlert('alert_receivedArmy', [user_id], vars)
}



// --------



var newAlert = function(alertType, user_ids, vars) {
    check(alertType, String)

    var userData = []

    _.each(user_ids, function(u) {
        userData.push({user_id:u, read:false})
    })

    Alerts.insert({
        created_at: new Date(),
        type: alertType,
        vars: vars,
        user_ids: userData
    })
}
