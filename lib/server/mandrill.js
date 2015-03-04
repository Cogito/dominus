// Meteor.startup(function() {
//     if (Meteor.settings.mandrill.username) {
//         return Meteor.Mandrill.config({
//             username: Meteor.settings.mandrill.username,
//             key: Meteor.settings.mandrill.apikey
//         });
//     }
// });


mandrillSendTemplate = function(templateSlug, toEmail, toName) {

    if (process.env.NODE_ENV != 'development') {
        Meteor.Mandrill.sendTemplate({
            "key": Meteor.settings.mandrill.apikey,
            "template_name": templateSlug,
            "template_content": [{}],
            "message": {
                "to": [{
                        "email": toEmail,
                        "name": toName
                    }]
            }
        })
    }
}
