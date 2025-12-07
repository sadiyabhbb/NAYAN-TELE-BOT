const axios = require("axios");

module.exports = {
  config: {
    name: "alldl",
    aliases: ["ad", "down", "download"],
    credits: "Nayan",
    prefix: true,
    permission: 0,
    description: "Download any video using the alldown API"
  },

  start: async ({ api, event, args }) => {
    try {
      const { threadId, messageId, senderId } = event;

      // যদি ইউজার লিংক না দেয়
      const url = args[0];
      if (!url) {
        await api.sendMessage(threadId, "❗একটা ভিডিও লিংক পাঠাও।", {
          reply_to_message_id: messageId,
        });
        return;
      }

      // রিঅ্যাকশন
      api.setMessageReaction("⏳", messageId, threadId, senderId);

      // API কল
      const apiUrl = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.video) {
        api.setMessageReaction("❌", messageId, threadId, senderId);
        return api.sendMessage(threadId, "⚠️ ভিডিও ডাউনলোড করা গেল না!", {
          reply_to_message_id: messageId
        });
      }

      const videoUrl = res.data.video;

      // ভিডিও ডাউনলোড
      const videoBuff = (await axios.get(videoUrl, { responseType: "arraybuffer" })).data;

      // ভিডিও পাঠানো
      await api.sendMessage(
        threadId,
        {
          body: "📥 আপনার ভিডিও রেডি!",
          attachment: videoBuff,
        },
        { reply_to_message_id: messageId }
      );

      // সফল রিঅ্যাকশন
      api.setMessageReaction("✅", messageId, threadId, senderId);

    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageId, event.threadId, event.senderId);
      api.sendMessage(event.threadId, "❗ Error: ভিডিও পাঠানো সম্ভব হয়নি!", {
        reply_to_message_id: event.messageId
      });
    }
  }
};
