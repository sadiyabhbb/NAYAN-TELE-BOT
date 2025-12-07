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
  const chatId = event.threadId || event.message.chat.id;
  const user = event.sender || event.message.from;
  const userId = user.id;

  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const prefix = global.config?.prefix || "/";

  // 🔴 CONFIGURATION: এখানে আপনার চ্যানেল বা গ্রুপের তথ্য দিন
  // বি:দ্র: বটকে অবশ্যই এই চ্যানেল/গ্রুপগুলোতে Admin হতে হবে মেম্বার চেক করার জন্য।
  const requiredChannels = [
    {
      name: "𝐋𝐈𝐊𝐇𝐎𝐍 𝐗 𝐁𝐎𝐎𝐌𝐒 𝐀𝐏𝐊 💀",
      id: "-1003319296127", // চ্যানেলের ইউজারনেম বা আইডি (যেমন: -100xxxxxxxx)
      url: "https://t.me/likhon_x_booms_apk" // জয়েন লিংক
    },
    {
      name: "X20",
      id: "-1002710357307",
      url: "https://t.me/likhon_premium"
    }
  ];

  // ⚙️ CHECKING MEMBERSHIP STATUS
  let notJoined = [];
  
  try {
    for (const channel of requiredChannels) {
      try {
        const member = await api.getChatMember(channel.id, userId);
        // স্ট্যাটাস যদি left, kicked বাদে অন্য কিছু হয় তবে সে মেম্বার
        if (member.status === 'left' || member.status === 'kicked') {
          notJoined.push(channel);
        }
      } catch (err) {
        // যদি বট চ্যানেলে এডমিন না থাকে বা চেক করতে না পারে, তবে ধরে নেয়া হবে জয়েন করেনি বা এরর দেখাবে
        // সেফটির জন্য এখানে তাকে notJoined লিস্টে রাখা হচ্ছে
        notJoined.push(channel);
        console.log(`Error checking member for ${channel.id}: ${err.message}`);
      }
    }
  } catch (e) {
    console.error("Force join system error:", e);
  }

  // ❌ IF USER HAS NOT JOINED ALL CHANNELS
  if (notJoined.length > 0) {
    let msg = `👋 *Hello ${firstName},*\n\n⚠️ *Access Denied!* \nTo use this bot, you must join our official channels first.\n\n👇 *Please join below:*`;
    
    // বাটন তৈরি করা (Inline Keyboard)
    const buttons = notJoined.map(ch => ([{
      text: `👉 Join ${ch.name}`,
      url: ch.url
    }]));

    // ভেরিফাই বাটন যোগ করা
    buttons.push([{
      text: "✅ I have Joined (Verify)",
      callback_data: "/start" // টেলিগ্রাম হলে এটা কাজ করবে, অথবা আবার /start লিখতে হবে
    }]);

    return api.sendMessage(chatId, msg, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  }

  // ✅ WELCOME MESSAGE (If joined all channels)
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
};
