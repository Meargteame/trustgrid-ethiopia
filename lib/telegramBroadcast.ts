export interface BroadcastConfig {
  telegramChannel?: string;
  telegramBotToken?: string;
}

export const broadcastToTelegram = async (
  config: BroadcastConfig,
  testimonial: {
    clientName: string;
    clientCompany?: string;
    clientRole?: string;
    text: string;
    rating?: number;
    score?: number;
    wallUrl?: string;
  }
): Promise<{ success: boolean; error?: string; messageId?: number }> => {
  let channel = config.telegramChannel?.trim();
  if (!channel) return { success: false, error: 'No Telegram channel configured.' };

  // Use custom bot token or default bot token from env
  const botToken = config.telegramBotToken?.trim() || (import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string);
  if (!botToken) {
    return { 
      success: false, 
      error: 'Bot token not provided. Enter your Telegram Bot Token or add VITE_TELEGRAM_BOT_TOKEN in .env.' 
    };
  }

  // Format channel name (@channel_name or -100xxxxxxxxxx chat id)
  const channelId = channel.startsWith('@') || channel.startsWith('-') ? channel : `@${channel}`;
  const stars = '⭐'.repeat(testimonial.rating || 5);
  const cleanQuote = testimonial.text
    .replace(/What did you like most about working with us\?\s*Answer:\s*/gi, '')
    .trim()
    .slice(0, 450);

  const author = `${testimonial.clientName}${testimonial.clientRole ? ` (${testimonial.clientRole})` : ''}${testimonial.clientCompany ? ` • ${testimonial.clientCompany}` : ''}`;
  const wallLink = testimonial.wallUrl || window.location.origin;

  const messageText = `
🌟 <b>NEW VERIFIED CUSTOMER PROOF</b>
━━━━━━━━━━━━━━━━━━━━
<i>"${cleanQuote}"</i>

👤 <b>Reviewer:</b> ${author}
🛡️ <b>Attestation:</b> Authenticated via Telegram
⭐ <b>Rating:</b> ${stars} (${testimonial.score || 100}/100 Trust Score)

🔗 <a href="${wallLink}">View Verified Wall of Proof</a>
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: channelId,
        text: messageText,
        parse_mode: 'HTML',
        disable_web_page_preview: false
      })
    });

    const data = await res.json();
    if (!data.ok) {
      // Provide actionable feedback on common Telegram bot mistakes
      if (data.error_code === 400 && data.description?.includes('chat not found')) {
        throw new Error(`Channel "${channelId}" not found. Ensure the username is exact and the channel is Public or you added the bot as an administrator.`);
      }
      if (data.error_code === 403 || data.description?.includes('not enough rights')) {
        throw new Error(`Bot is not an administrator in ${channelId}. Add the bot to your channel with "Post Messages" permission.`);
      }
      throw new Error(data.description || 'Telegram API rejected broadcast.');
    }
    return { success: true, messageId: data.result?.message_id };
  } catch (err: any) {
    console.error('Telegram broadcast error:', err);
    return { success: false, error: err.message || 'Network error connecting to Telegram Bot API.' };
  }
};
