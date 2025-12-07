module.exports.config = {
  name: "start",
  aliases: [],
  description: "Displays the premium start menu with force join system",
  version: "1.0.2",
  prefix: true,
  permission: 0,
  category: "general",
  usages: "/start"
};

module.exports.start = async ({ api, event }) => {
  try {
    const chatId = event.threadId || event.message.chat.id;
    const user = event.sender || event.message.from;
    const userId = user.id;

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
        // স্ট্যাটাস left, kicked বাদে বাকি সব (creator, administrator, member) এলাউড
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

      // বাটন তৈরি করা
      const buttons = notJoined.map(ch => ([{
        text: `👉 Join ${ch.name}`,
        url: ch.url
      }]));

      // ভেরিফাই বাটন
      buttons.push([{
        text: "✅ I have Joined (Click Here)",
        callback_data: "/start" 
      }]);

      return api.sendMessage(chatId, msg, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    }

    // ✅ WELCOME MESSAGE (If joined)
    const welcomeMessage = `
✨ *Welcome to Nayan Bot!* ✨

👋 Hello, *${firstName} ${lastName}*

💡 I am your all-in-one assistant, ready to help you with:
─────────────────────────────
📌 *Features:*
• 🔒 Chat Lock System → \`${prefix}lock\`
• 🤖 AI Chat (Gemini) → \`${prefix}gemini\`
• 🖼 AI Image Tools → \`${prefix}img\`
• 🤖 AI Chat (GPT) → \`${prefix}ai\`
• ⚙️ Help See All cmnd → \`${prefix}help\`
─────────────────────────────

🚀 *Quick Tips:*
• Type \`${prefix}help\` to see all commands.
• Reply to images with \`${prefix}img\` to use AI tools.
• Use \`${prefix}lock\` to manage chat locks.
• Explore Gemini AI with \`${prefix}gemini\`.

💎 *Premium Experience Activated!* Enjoy smooth, fast, and responsive commands.
─────────────────────────────

© *Developed by Mohammad Nayan*
`;

    await api.sendMessage(chatId, welcomeMessage, { parse_mode: "Markdown", reply_to_message_id: event.message.message_id });

  } catch (error) {
    console.error("Start command error:", error);
  }
};
