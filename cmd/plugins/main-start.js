module.exports.config = {
  name: "start",
  aliases: [],
  description: "Displays the premium start menu with force join system",
  version: "1.0.3",
  prefix: true,
  permission: 0,
  category: "general",
  usages: "/start"
};

module.exports.start = async ({ api, event }) => {
  try {
    const chatId = event.threadId || event.message?.chat?.id || event.chat?.id;
    const user = event.sender || event.message?.from || event.from;
    const userId = user.id;

    // বাটনে ক্লিক করলে ইভেন্ট অন্যভাবে হ্যান্ডেল করতে হয়
    if (event.callback_query) {
      // বাটন লোডিং বন্ধ করা
      await api.answerCallbackQuery(event.callback_query.id, { text: "Checking membership...", show_alert: false });
    }

    const firstName = user.first_name || "User";
    const lastName = user.last_name || "";
    const prefix = global.config?.prefix || "/";

    // 🔴 CONFIGURATION: Channel List
    const requiredChannels = [
      {
        name: "𝐋𝐈𝐊𝐇𝐎𝐍 𝐗 𝐁𝐎𝐎𝐌𝐒 𝐀𝐏𝐊 💀",
        id: "-1003319296127", 
        url: "https://t.me/likhon_x_booms_apk"
      },
      {
        name: "X20",
        id: "-1002710357307",
        url: "https://t.me/likhon_premium"
      }
    ];

    // ⚙️ CHECKING MEMBERSHIP STATUS
    let notJoined = [];

    for (const channel of requiredChannels) {
      try {
        const member = await api.getChatMember(channel.id, userId);
        if (!member || member.status === 'left' || member.status === 'kicked') {
          notJoined.push(channel);
        }
      } catch (err) {
        // বট এডমিন না থাকলে বা এরর হলে সেফটির জন্য জয়েন করতে বলবে
        notJoined.push(channel);
        console.log(`Force Join Error on ${channel.name}: ${err.message}`);
      }
    }

    // ❌ IF USER HAS NOT JOINED ALL CHANNELS
    if (notJoined.length > 0) {
      let msg = `👋 *Hello ${firstName},*\n\n⚠️ *Access Denied!* \nTo use this bot, you must join our official channels first.\n\n👇 *Please join below:*`;

      const buttons = notJoined.map(ch => ([{
        text: `👉 Join ${ch.name}`,
        url: ch.url
      }]));

      // Verify Button (Correct Callback)
      buttons.push([{
        text: "✅ I have Joined (Verify)",
        callback_data: "/start" 
      }]);

      // যদি আগের মেসেজ থাকে (ভেরিফাই বাটন চাপার পর), সেটা ডিলিট করে নতুন করে ওয়ার্নিং দিবে
      if (event.message?.message_id && event.callback_query) {
         try {
             await api.deleteMessage(chatId, event.message.message_id);
         } catch (e) { console.log("Delete error", e); }
      }

      return api.sendMessage(chatId, msg, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    }

    // ✅ IF JOINED: DELETE PREVIOUS WARNING MSG (If clicked verify)
    if (event.message?.message_id && event.callback_query) {
         try {
             await api.deleteMessage(chatId, event.message.message_id);
         } catch (e) { console.log("Delete error", e); }
    }

    // ✅ WELCOME MESSAGE
    const welcomeMessage = `
✨ *Welcome to Nayan Bot!* ✨

👋 Hello, *${firstName} ${lastName}*

💡 I am your all-in-one assistant.
─────────────────────────────
📌 *Features:*
• 🔒 Chat Lock System → \`${prefix}lock\`
• 🤖 AI Chat (Gemini) → \`${prefix}gemini\`
• 🖼 AI Image Tools → \`${prefix}img\`
• 🤖 AI Chat (GPT) → \`${prefix}ai\`
• ⚙️ Help See All cmnd → \`${prefix}help\`
─────────────────────────────

💎 *Premium Experience Activated!*
─────────────────────────────
© *Developed by Mohammad Nayan*
`;

    await api.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown" });

  } catch (error) {
    console.error("Start command error:", error);
  }
};
