const axios = require("axios");

module.exports = {
  config: {
    name: "alldl",
    credits: "Nayan",
    prefix: false,
    permission: 0,
    description: "Auto video downloader by detecting URLs"
  },

  // Auto Trigger
  handleEvent: async ({ api, event }) => {
    try {
      const { body, threadId, messageId, senderId } = event;

      if (!body) return;

      // লিংক ডিটেক্ট
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const links = body.match(urlRegex);

      if (!links) return; // যদি লিংক না থাকে, কিছু করবে না

      const url = links[0];

      // রিঅ্যাকশন
      api.setMessageReaction("⏳", messageId, threadId, senderId);

      // API কল
      const apiUrl = `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);

      if (!res.data || !res.data.video) {
        api.setMessageReaction("❌", messageId, threadId, senderId);
        return api.sendMessage(threadId, "⚠️ ভিডিও পাওয়া যায়নি বা ডাউনলোড সম্ভব হয়নি।", {
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
          body: "📥 ভিডিও ডাউনলোড সম্পন্ন!",
          attachment: videoBuff
        },
        { reply_to_message_id: messageId }
      );

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
