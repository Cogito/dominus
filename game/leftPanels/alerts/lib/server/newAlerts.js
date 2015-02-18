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


alert_addedToChatroom = function(user_id, addedByUser_id, room_id) {
    check(user_id, String)
    check(addedByUser_id, String)
    check(room_id, String)

    var vars = {addedByUser_id:addedByUser_id, room_id:room_id}
    newAlert('alert_addedToChatroom', [user_id], vars)
}


alert_kickedFromChatroom = function(user_id, room_id) {
    check(user_id, String)
    check(room_id, String)

    vars = {room_id:room_id}
    newAlert('alert_kickedFromChatroom', [user_id], vars)
}


alert_chatroomMadeAdmin = function(user_id, room_id) {
    check(user_id, String)
    check(room_id, String)

    vars = {room_id:room_id}
    newAlert('alert_chatroomMadeAdmin', [user_id], vars)
}


alert_chatroomRemovedFromAdmin = function(user_id, room_id) {
    check(user_id, String)
    check(room_id, String)

    vars = {room_id:room_id}
    newAlert('alert_chatroomRemovedFromAdmin', [user_id], vars)
}


alert_chatroomNowOwner = function(user_id, room_id) {
    check(user_id, String)
    check(room_id, String)

    vars = {room_id:room_id}
    newAlert('alert_chatroomNowOwner', [user_id], vars)
}


alert_vassalIsUnderAttack = function(arrayOfLordIds, vassal_id, battle_id) {
    check(arrayOfLordIds, Array)
    check(vassal_id, String)
    check(battle_id, String)
    var vars = {vassal_id:vassal_id, battle_id:battle_id}
    newAlert('alert_vassalIsUnderAttack', arrayOfLordIds, vars)
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
