import { Resend } from "resend";

import type { SendScoreInput } from "@/lib/validation";

interface SendScoreEmailResult {
  providerId: string | null;
}

/** Sends the player's score email through Resend using a mobile-friendly HTML template. */
export async function sendScoreEmail(
  payload: SendScoreInput,
): Promise<SendScoreEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Missing RESEND_API_KEY or RESEND_FROM_EMAIL.");
  }

  const resend = new Resend(apiKey);
  const subject = `${payload.name}, Skor Kamu Sudah Keluar!`;

  const response = await resend.emails.send({
    from: fromEmail,
    to: [payload.email],
    subject,
    html: buildScoreEmailHtml(payload.name, payload.score),
  });

  if (response.error) {
    throw new Error("Email provider rejected the request.");
  }

  return {
    providerId: response.data?.id ?? null,
  };
}

/** Builds the required Indonesian score message as a single-column HTML email layout. */
function buildScoreEmailHtml(name: string, score: number): string {
  const escapedName = escapeHtml(name);

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0;padding:0;background:#050a14;font-family:'DM Sans',Arial,sans-serif;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;background:#0d1a2b;border:1px solid #12314f;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 24px 12px;color:#00e5ff;font-size:12px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">
                MAXY Academy Arcade
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 10px;color:#e8f4fd;font-size:28px;line-height:1.3;font-weight:800;">
                ${escapedName}, Skor Kamu Sudah Keluar!
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 20px;color:#5a7a99;font-size:14px;line-height:1.7;">
                Halo ${escapedName}, selamat kamu mendapatkan poin ${score}. Kamu keren! Naikin terus skill mu supaya makin jago. Jangan lupa cek terus IG @maxy.academy dan TikTok @maxy.academy untuk update yang menarik.
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px 24px;">
                <div style="background:linear-gradient(135deg,#001a2e,#003753);border-radius:14px;padding:20px 16px;text-align:center;">
                  <div style="font-size:12px;letter-spacing:1.4px;color:#5a7a99;text-transform:uppercase;">Skor Kamu</div>
                  <div style="font-family:'Orbitron',Arial,sans-serif;font-size:52px;line-height:1.1;font-weight:800;color:#ffb300;margin-top:6px;">${score}</div>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
