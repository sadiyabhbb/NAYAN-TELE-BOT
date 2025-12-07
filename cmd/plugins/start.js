// start.js (Channel Compatible)
module.exports = {
  config: {
    name: "start",
    credits:"LIKHON AHMED",
    aliases: ["strat"],
    prefix: true,
    permission: 0
  },

  // এখানে তোমার সব চ্যানেলের ID + link দাও
  requiredChannels: [
    { id: -1003319296127, link: "https://t.me/likhon_x_booms_apk" },
    { id: -1002710357307, link: "https://t.me/likhon_premium" },
    { id: -1002364206583, link: "https://t.me/workingtrickshub_404" }
  ],

  start: async ({ api, event, globalData }) => {
    const chatId = event.chat.id;
    const userId = event.from.id;

    if (!globalData.forceJoin) globalData.forceJoin = {};
    globalData.forceJoin[userId] = false;

    // Inline keyboard তৈরি
    const buttons = module.exports.requiredChannels.map(c => {
      return [{ text: "Join Channel", url: c.link }];
    });

    // শেষে "Joined" বাটন
    buttons.push([{ text: "✔ I Joined All", callback_data: "verify_joined" }]);

    const msg =
`🔰 *Force Join Required*

নীচের সব চ্যানেলে জয়েন করুন।
তারপর নিচের *I Joined All* বাটনে চাপ দিন।`;

    return api.sendMessage(chatId, msg, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons }
    });
  },

  // CALLBACK BUTTON HANDLER
  onCallback: async ({ api, event, globalData }) => {
    const data = event.data;
    const userId = event.from.id;
    const chatId = event.message.chat.id;

    if (data === "verify_joined") {
      try {
        let joinedAll = true;

        // সব চ্যানেলে member কি না চেক
        for (const ch of module.exports.requiredChannels) {
          const info = await api.getChatMember(ch.id, userId);

          // Channel এ member হলে status "member" হয়, না হলে "left" বা "kicked"
          if (!["member", "administrator", "creator"].includes(info.status)) {
            joinedAll = false;
            break;
          }
        }

        if (joinedAll) {
          globalData.forceJoin[userId] = true;

          return api.answerCallbackQuery(event.id, {
            text: "✔ Verified! You can use the bot now.",
            show_alert: true
          });
        } else {
          return api.answerCallbackQuery(event.id, {
            text: "❌ You must join ALL the channels first!",
            show_alert: true
          });
        }

      } catch (err) {
        return api.answerCallbackQuery(event.id, {
          text: "⚠ Bot must be admin in all channels.",
          show_alert: true
        });
      }
    }
  },

  // OTHER COMMAND PREVENTION SYSTEM
  onCall: async ({ api, event, globalData }) => {
    const userId = event.from.id;
    const chatId = event.chat.id;

    if (!globalData.forceJoin) globalData.forceJoin = {};

    if (!globalData.forceJoin[userId]) {
      const buttons = module.exports.requiredChannels.map(c => {
        return [{ text: "Join Channel", url: c.link }];
      });

      buttons.push([{ text: "✔ I Joined All", callback_data: "verify_joined" }]);

      return api.sendMessage(chatId,
`🚫 *Access Blocked*

বট ব্যবহার করতে হলে আগে সব চ্যানেলে জয়েন করুন।`, {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: buttons }
      });
    }

    return true;
  }
};
