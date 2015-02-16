gAlert_nameChange = function(user_id, previousName) {
    check(user_id, String)
    check(previousName, String)

    var vars = {user_id:user_id, previousName:previousName}
    newGlobalAlert('ga_nameChange', vars)
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
