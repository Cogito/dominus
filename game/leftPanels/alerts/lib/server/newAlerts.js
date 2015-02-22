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


// joinedCastle is either null or the castle id
// same with village and army
alert_armyFinishedAllMoves = function(user_id, army_id, x, y, joinedCastle, joinedVillage, joinedArmy) {
    check(user_id, String)
    check(army_id, String)
    check(x, validNumber)
    check(y, validNumber)
    check(joinedCastle, Match.OneOf(null, String))
    check(joinedVillage, Match.OneOf(null, String))
    check(joinedArmy, Match.OneOf(null, String))
    var vars = {army_id:army_id, x:x, y:y, joinedCastle:joinedCastle, joinedVillage:joinedVillage, joinedArmy:joinedArmy}
    newAlert('alert_armyFinishedAllMoves', [user_id], vars)
}


alert_villageDestroyed = function(user_id, battle_id, villageName) {
    check(user_id, String)
    check(battle_id, String)
    check(villageName, String)
    var vars = {battle_id:battle_id, villageName:villageName}
    newAlert('alert_villageDestroyed', [user_id], vars)
}


alert_armyDestroyed = function(user_id, battle_id, armyName) {
    check(user_id, String)
    check(battle_id, String)
    check(armyName, String)
    var vars = {battle_id:battle_id, armyName:armyName}
    newAlert('alert_armyDestroyed', [user_id], vars)
}


alert_lostVassal = function(user_id, lostVassalUser_id, vassalsNewLord_id) {
    check(user_id, String)
    check(lostVassalUser_id, String)
    check(vassalsNewLord_id, String)
    var vars = {lostVassalUser_id:lostVassalUser_id, vassalsNewLord_id:vassalsNewLord_id}
    newAlert('alert_lostVassal', [user_id], vars)
}


alert_gainedVassal = function(user_id, newVassalUser_id, vassalsNewLord_id) {
    check(user_id, String)
    check(newVassalUser_id, String)
    check(vassalsNewLord_id, String)
    var vars = {newVassalUser_id:newVassalUser_id, vassalsNewLord_id:vassalsNewLord_id}
    newAlert('alert_gainedVassal', [user_id], vars)
}


alert_newLord = function(user_id, lord_id) {
    check(user_id, String)
    check(lord_id, String)
    var vars = {lord_id:lord_id}
    newAlert('alert_newLord', [user_id], vars)
}


alert_newKingChatroom = function(user_id) {
    check(user_id, String)
    var vars = {}
    newAlert('alert_newKingChatroom', [user_id], vars)
}


alert_noLongerDominus = function(user_id) {
    check(user_id, String)
    var vars = {}
    newAlert('alert_noLongerDominus', [user_id], vars)
}


alert_noLongerDominusNewUser = function(user_id) {
    check(user_id, String)
    var vars = {}
    newAlert('alert_noLongerDominusNewUser', [user_id], vars)
}


alert_youAreDominus = function(user_id) {
    check(user_id, String)
    var vars = {}
    newAlert('alert_youAreDominus', [user_id], vars)
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
