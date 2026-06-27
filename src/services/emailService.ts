// Resend Email Delivery Integration

export const sendMilestoneEmail = async (
  userEmail: string,
  userName: string,
  careerGoal: string,
  milestoneTitle: string
) => {
  const apiKey = (import.meta.env.VITE_RESEND_API_KEY as string) || '';
  
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('placeholder')) {
    console.warn('[EmailService] Resend API Key is missing. Email notification skipped.');
    return;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'PathWise Copilot <onboarding@resend.dev>',
        to: [userEmail],
        subject: `🎯 Milestone Unlocked: ${milestoneTitle}`,
        html: `
          <div style="background-color: #050816; color: #f8fafc; font-family: sans-serif; padding: 24px; border-radius: 16px; border: 1px solid #1e293b; max-width: 600px; margin: auto;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #38bdf8; font-weight: 800; font-size: 24px; margin: 0;">PATHWISE V2</h2>
              <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 4px;">Your AI Career Copilot</p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">Hello <strong>${userName}</strong>,</p>
            
            <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1;">
              Congratulations! You have successfully completed the milestone <strong>"${milestoneTitle}"</strong> on your personalized roadmap toward becoming a <strong>${careerGoal}</strong>.
            </p>
            
            <div style="background-color: #0f172a; border: 1px solid #1e293b; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: center;">
              <span style="font-size: 11px; text-transform: uppercase; font-family: monospace; color: #10b981; display: block; margin-bottom: 6px;">Telemetry Update</span>
              <strong style="font-size: 20px; color: #10b981;">+250 XP Awarded</strong>
            </div>

            <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
              Keep learning and securing your daily streak. Your next milestone is now unlocked on your interactive path board.
            </p>
            
            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
            
            <p style="font-size: 10px; color: #475569; text-align: center; margin: 0;">
              Sent via Resend email API. PathWise career operating system.
            </p>
          </div>
        `
      })
    });

    if (response.ok) {
      console.log(`[EmailService] Milestone notification successfully sent to ${userEmail}`);
    } else {
      const errText = await response.text();
      console.warn(`[EmailService] Failed to send email via Resend: ${errText}`);
    }
  } catch (error) {
    console.error('[EmailService] Connection failed', error);
  }
};
