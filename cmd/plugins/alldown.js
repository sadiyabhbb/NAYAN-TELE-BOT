const axios = require('axios');

module.exports = {
  config: {
    name: "alldown",
    credits: "Nayan",
    aliases: ["alldl", "dl", "down"],
    prefix: "auto",
    permission: 0,
    description: "Auto video downloader (Event Based Only)",
  },

  // =======================
  // AUTO EVENT HANDLER
  // =======================
  handleEvent: async function ({ event, api }) {
    try {
      const text = event.body || "";
      const msg = event.msg;
      if (!msg || !msg.chat) return;

      const chatId = msg.chat.id;

      if (!text || !text.startsWith("https://")) return;

      const waitMsg = await api.sendMessage(
        chatId,
        "⏳ Processing your video...",
        { reply_to_message_id: msg.message_id }
      );

      // 🔥 NEW API
      const apiURL = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(text)}`;
      const res = await axios.get(apiURL);

      const { high, title } = res.data;

      const stream = (await axios.get(high, { responseType: "stream" })).data;

      const caption = `🎬 *Title:* ${title}`;

      const markup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Bot Owner", url: "https://t.me/MOHAMMADNAYAN" }],
          ],
        },
      };

      await api.deleteMessage(chatId, waitMsg.message_id);

      await api.sendVideo(chatId, stream, {
        caption,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id,
        ...markup,
      });

    } catch (error) {
      console.log("Error in alldown handleEvent:", error);

      const fallbackChatId = event?.msg?.chat?.id || event.threadId;

      await api.sendMessage(
        fallbackChatId,
        "❌ Failed to process this link.",
        { reply_to_message_id: event?.msg?.message_id }
      );
    }
  },

  // =======================
  // MANUAL /alldl COMMAND
  // =======================
  start: async ({ event, api }) => {
    try {
      const chatId = event.message.chat.id;
      const msg = event.message;
      const inputText = event.body;

      if (!inputText) {
        await api.sendMessage(
          chatId,
          '❌ Input Link! Example: /alldl <link>',
          { reply_to_message_id: msg.message_id }
        );
        return;
      }

      const waitMsg = await api.sendMessage(
        chatId,
        '⏳ Processing your request...',
        { reply_to_message_id: msg.message_id }
      );

      // 🔥 NEW API
      const apiURL = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(inputText)}`;
      const res = await axios.get(apiURL);

      const { high, title } = res.data;

      const vid = (
        await axios.get(high, { responseType: 'stream' })
      ).data;

      const caption = `🎬 *Title:* ${title}`;

      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔗 Bot Owner', url: 'https://t.me/MOHAMMADNAYAN' }],
          ],
        },
      };

      await api.deleteMessage(chatId, waitMsg.message_id);

      await api.sendVideo(chatId, vid, {
        caption,
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id,
        ...replyMarkup,
      });

    } catch (error) {
      console.error('Error:', error.message);

      await api.sendMessage(
        event.message.chat.id,
        '❌ An error occurred while processing your request.',
        { reply_to_message_id: event.message.message_id }
      );
    }
  },
};
