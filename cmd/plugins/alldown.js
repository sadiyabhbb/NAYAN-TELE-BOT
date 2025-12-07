const axios = require("axios");
const { alldown } = require("nayan-media-downloaders");

module.exports = {
  config: {
    name: "alldown",
    credits: "Nayan",
    aliases: ["alldl", "dl", "down"],
    prefix: "auto",
    permission: 0,
    description: "Auto video downloader (Event Based Only)",
  },

  handleEvent: async function ({ event, api }) {
    try {
      const text = event.body || "";
      const msg = event.msg;
      if (!msg || !msg.chat) return;

      const chatId = msg.chat.id;

      if (!text || !text.startsWith("https://")) return;

      // Wait message
      const waitMsg = await api.sendMessage(
        chatId,
        "⏳ Processing your video...",
        { reply_to_message_id: msg.message_id }
      );

      // Resolve redirected TikTok links
      let finalURL = text;
      try {
        const redirect = await axios.get(text, { maxRedirects: 5 });
        finalURL = redirect?.request?.res?.responseUrl || text;
      } catch (e) {}

      const res = await alldown(finalURL);

      // SAFE CHECK
      if (!res || !res.data) {
        await api.deleteMessage(chatId, waitMsg.message_id);
        return api.sendMessage(
          chatId,
          "❌ API error! No data returned.",
          { reply_to_message_id: msg.message_id }
        );
      }

      const { high, title } = res.data;

      if (!high) {
        await api.deleteMessage(chatId, waitMsg.message_id);
        return api.sendMessage(
          chatId,
          "❌ Download link not found!",
          { reply_to_message_id: msg.message_id }
        );
      }

      const stream = (
        await axios.get(high, { responseType: "stream" })
      ).data;

      const caption = `🎬 *Title:* ${title}`;

      const markup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Bot Owner", url: "https://t.me/rx_rihad" }],
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

  start: async ({ event, api }) => {
    try {
      const chatId = event.message.chat.id;
      const msg = event.message;
      const inputText = event.body;

      if (!inputText) {
        return api.sendMessage(
          chatId,
          "❌ Input Link! Example: /alldl <link>",
          { reply_to_message_id: msg.message_id }
        );
      }

      // Wait message
      const waitMsg = await api.sendMessage(chatId, "⏳ Processing your request...", {
        reply_to_message_id: msg.message_id,
      });

      // Resolve redirect
      let finalURL = inputText;
      try {
        const redirect = await axios.get(inputText, { maxRedirects: 5 });
        finalURL = redirect?.request?.res?.responseUrl || inputText;
      } catch (e) {}

      const apis = await alldown(finalURL);

      if (!apis || !apis.data) {
        await api.deleteMessage(chatId, waitMsg.message_id);
        return api.sendMessage(
          chatId,
          "❌ API did not return data!",
          { reply_to_message_id: msg.message_id }
        );
      }

      const { high, title } = apis.data;

      if (!high) {
        await api.deleteMessage(chatId, waitMsg.message_id);
        return api.sendMessage(
          chatId,
          "❌ Download link unavailable!",
          { reply_to_message_id: msg.message_id }
        );
      }

      const vid = (
        await axios.get(high, { responseType: "stream" })
      ).data;

      const caption = `🎬 *Title:* ${title}`;

      const replyMarkup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Bot Owner", url: "https://t.me/MOHAMMADNAYAN" }],
          ],
        },
      };

      await api.deleteMessage(chatId, waitMsg.message_id);

      await api.sendVideo(chatId, vid, {
        caption,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id,
        ...replyMarkup,
      });

    } catch (error) {
      console.error("Error:", error.message);

      await api.sendMessage(
        event.message.chat.id,
        "❌ An error occurred while processing your request.",
        { reply_to_message_id: event.message.message_id }
      );
    }
  },
};
