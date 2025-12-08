module.exports = {
  config: {
    name: "infoout",
    credits: "Nayan",
    aliases: ["inf"],
    prefix: true,
    permission: 2
  },

  // এই object দিয়ে track করব কোন thread/mood enable
  mood: {},

  start: async ({ api, event, args, infoout }) => {
    const { threadId, messageId, senderId } = event;

    // Toggle mood enable/disable
    if (!infoout.mood) infoout.mood = {}; // ensure object exists

    if (!args[0]) {
      return api.sendMessage(threadId, "Usage: /infoout on | off", { reply_to_message_id: messageId });
    }

    const sub = args[0].toLowerCase();

    if (sub === "on") {
      infoout.mood[threadId] = true;
      return api.sendMessage(threadId, "✅ InfoOut mood ENABLED for this thread.", { reply_to_message_id: messageId });
    } else if (sub === "off") {
      infoout.mood[threadId] = false;
      return api.sendMessage(threadId, "❌ InfoOut mood DISABLED for this thread.", { reply_to_message_id: messageId });
    } else {
      return api.sendMessage(threadId, "Unknown option. Use on/off.", { reply_to_message_id: messageId });
    }
  },

  // Event listener: সবার msg capture
  onMessage: async ({ api, event, infoout }) => {
    const { threadId } = event;

    if (infoout.mood && infoout.mood[threadId]) {
      // Mood enabled → capture msg
      const jsonData = {
        threadId: threadId,
        messageId: event.messageId,
        senderId: event.senderId,
        timestamp: event.timestamp,
        text: event.body,
        attachments: event.attachments || [],
        isReply: event.messageReply ? true : false,
        replyTo: event.messageReply ? event.messageReply.messageId : null
      };

      // Send JSON to the same thread OR bot owner
      const ownerId = "8287206585"; // <-- এখানে নিজের টেলিগ্রাম UID দাও
      await api.sendMessage(ownerId, "```json\n" + JSON.stringify(jsonData, null, 2) + "\n```", { parse_mode: "Markdown" });
    }
  }
};
