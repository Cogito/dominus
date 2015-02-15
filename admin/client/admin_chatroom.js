Template.admin_chatroom.helpers({
    chats: function() {
        var chats = Roomchats.find({}, {sort: {created_at: -1}})
        return chats.map(function(chat) {
            var user = RoomMembers.findOne(chat.user_id)
            if (user) {
                chat.username = user.username
                chat.castle_id = user.castle_id
                chat.x = user.x
                chat.y = user.y
            }
            return chat
        })
    }
})
