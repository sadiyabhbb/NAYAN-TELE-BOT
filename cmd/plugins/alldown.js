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
  // EVENT BASED DOWNLOAD
  // =======================
  handleEvent: async function ({ event, api }) {
    try {
      const text = event.body || "";
      const msg = event.msg;
      if (!msg || !msg.chat) return;

      const chatId = msg.chat.id;
      if (!text.startsWith("http")) return;

      const waitMsg = await api.sendMessage(chatId, "⏳ Processing your video...", {
        reply_to_message_id: msg.message_id
      });

      const apiURL = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(text)}`;
      const res = await axios.get(apiURL);

      const videoURL = res.data.data?.high || res.data.data?.low;
      const title = res.data.data?.title || "Video";

      if (!videoURL) throw new Error("Download URL not found!");

      const stream = (await axios.get(videoURL, { responseType: "stream" })).data;

      await api.deleteMessage(chatId, waitMsg.message_id);

      await api.sendVideo(chatId, stream, {
        caption: `🎬 *Title:* ${title}`,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Bot Owner", url: "https://t.me/MOHAMMADNAYAN" }]
          ]
        }
      });

    } catch (error) {
      console.log("Error in alldown handleEvent:", error);
      await api.sendMessage(event?.msg?.chat?.id, "❌ Failed to process this link.", {
        reply_to_message_id: event?.msg?.message_id
      });
    }
  },

  // =======================
  // MANUAL /alldl COMMAND
  // =======================
  start: async ({ event, api }) => {
    try {
      const chatId = event.message.chat.id;
      const msg = event.message;
      const input = event.body;

      if (!input) {
        return api.sendMessage(chatId, "❌ Input Link! Example: /alldl <link>", {
          reply_to_message_id: msg.message_id
        });
      }

      const waitMsg = await api.sendMessage(chatId, "⏳ Processing your request...", {
        reply_to_message_id: msg.message_id
      });

      const apiURL = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(input)}`;
      const res = await axios.get(apiURL);

      const videoURL = res.data.data?.high || res.data.data?.low;
      const title = res.data.data?.title || "Video";

      if (!videoURL) throw new Error("Download URL not found!");

      const stream = (await axios.get(videoURL, { responseType: "stream" })).data;

      await api.deleteMessage(chatId, waitMsg.message_id);

      await api.sendVideo(chatId, stream, {
        caption: `🎬 *Title:* ${title}`,
        parse_mode: "Markdown",
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔗 Bot Owner", url: "https://t.me/MOHAMMADNAYAN" }]
          ]
        }
      });

    } catch (err) {
      console.error("Error in /alldl command:", err);
      await api.sendMessage(chatId, "❌ Error while processing request.", {
        reply_to_message_id: event.message.message_id
      });
    }
  }
};
