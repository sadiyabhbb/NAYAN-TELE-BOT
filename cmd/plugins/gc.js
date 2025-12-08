module.exports = {
  config: {
    name: "gc",
    credits: "LIKHON AHMED",
    aliases: ["grp"],
    description: " Manage Your Group Chat Lock/Unlock Feature",
    prefix: true,
    tags: ["groupM"],
    permission: 2 
  },

  start: async ({ api, event, args }) => {
    const { threadId, messageId } = event;
    if (!args[0]) {
      return api.sendMessage(threadId, "Usage: /gc lock | /gc unlock", { reply_to_message_id: messageId });
    }

    const sub = args[0].toLowerCase();

    const lockPerms = {
      can_send_messages: false,
      can_send_media_messages: false,
      can_send_polls: false,
      can_send_other_messages: false,
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false
    };

    const unlockPerms = {
      can_send_messages: true,
      can_send_media_messages: true,
      can_send_polls: true,
      can_send_other_messages: true,
      can_add_web_page_previews: true,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false
    };

    try {
      if (sub === "lock") {
        await api.setChatPermissions(threadId, lockPerms);
        return api.sendMessage(threadId, "🚫 Group is locked!", { reply_to_message_id: messageId });
      } else if (sub === "unlock") {
        await api.setChatPermissions(threadId, unlockPerms);
        return api.sendMessage(threadId, "✅ Group is unlocked!", { reply_to_message_id: messageId });
      } else {
        return api.sendMessage(threadId, "Unknown subcommand. Use lock or unlock.", { reply_to_message_id: messageId });
      }
    } catch(err) {
      console.error(err);
      return api.sendMessage(threadId, "❌ Failed to change permissions — make sure bot is admin with restrict‑members rights.", { reply_to_message_id: messageId });
    }
  }
};
