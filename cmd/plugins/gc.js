module.exports = {
  config: {
    name: "gc",
    credits: "Nayan",
    aliases: ["gccontrol", "groupcontrol"],
    prefix: true,
    permission: 2 // গ্রুপ এডমিন বা বট ম্যানেজার
  },

  start: async ({ api, event, args }) => {
    const { threadId, messageId } = event;

    if (!args[0]) {
      return api.sendMessage(threadId, "❗ Usage:\n/gc lock\n/gc unlock\n/gc mute [reply/@uid] [seconds]", { reply_to_message_id: messageId });
    }

    const subcmd = args[0].toLowerCase();

    // ================= LOCK =================
    if (subcmd === "lock") {
      try {
        await api.setThreadMute(threadId, { mute: true, duration: 0 }); // সব মেসেজ mute
        return api.sendMessage(threadId, "🚫 Group chat is now LOCKED!", { reply_to_message_id: messageId });
      } catch (err) {
        return api.sendMessage(threadId, "❌ Failed to lock the chat.", { reply_to_message_id: messageId });
      }
    }

    // ================= UNLOCK =================
    if (subcmd === "unlock") {
      try {
        await api.setThreadMute(threadId, { mute: false });
        return api.sendMessage(threadId, "✅ Group chat is now UNLOCKED!", { reply_to_message_id: messageId });
      } catch (err) {
        return api.sendMessage(threadId, "❌ Failed to unlock the chat.", { reply_to_message_id: messageId });
      }
    }

    // ================= MUTE =================
    if (subcmd === "mute") {
      let userId;
      let duration;

      // যদি reply থাকে
      if (event.messageReply) {
        userId = event.messageReply.senderId;
      } else if (args[1]) {
        // UID বা username
        if (args[1].startsWith("@")) {
          // username থেকে ID বের করা
          try {
            const user = await api.getUserId(args[1]);
            userId = user.id;
          } catch (err) {
            return api.sendMessage(threadId, "❌ Cannot find user.", { reply_to_message_id: messageId });
          }
        } else {
          userId = args[1];
        }
      } else {
        return api.sendMessage(threadId, "⚠️ Please specify a user to mute.", { reply_to_message_id: messageId });
      }

      if (!args[2]) return api.sendMessage(threadId, "⚠️ Please specify duration in seconds.", { reply_to_message_id: messageId });

      duration = parseInt(args[2]);
      if (isNaN(duration)) return api.sendMessage(threadId, "⚠️ Invalid duration.", { reply_to_message_id: messageId });

      try {
        await api.setUserMute(threadId, userId, duration);
        return api.sendMessage(threadId, `🔇 User muted for ${duration} seconds.`, { reply_to_message_id: messageId });
      } catch (err) {
        return api.sendMessage(threadId, "❌ Failed to mute the user.", { reply_to_message_id: messageId });
      }
    }

    // ================= UNKNOWN SUBCOMMAND =================
    return api.sendMessage(threadId, "❗ Unknown subcommand.\nUsage:\n/gc lock\n/gc unlock\n/gc mute [reply/@uid] [seconds]", { reply_to_message_id: messageId });
  },
};
