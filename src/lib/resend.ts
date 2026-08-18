import { Resend } from 'resend';
import { CreateReservationResponse } from '@/types/database';
import { formatPrice } from './utils';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendReservationNotification(
  reservation: CreateReservationResponse
): Promise<{ success: boolean; error?: string }> {
  const recipientEmail = process.env.ORDER_NOTIFICATION_EMAIL || 'retroboutique2020@gmail.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://retro-boutique.vercel.app';
  const adminUrl = `${siteUrl}/admin/reservations`;

  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY is not configured. Email notification skipped.');
    return {
      success: false,
      error: 'RESEND_API_KEY not configured',
    };
  }

  const itemsHtml = reservation.items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #eeeeee;">
        <td style="padding: 10px 0; font-weight: 600; color: #11110f;">${item.product_name}</td>
        <td style="padding: 10px 8px; text-align: center; color: #555555;">${item.size}</td>
        <td style="padding: 10px 8px; text-align: center; color: #555555;">${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #11110f;">${formatPrice(item.line_total)}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Нова резервација ${reservation.reservation_number}</title>
      </head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f1ea; color: #11110f;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border: 1px solid #e2ddd3; padding: 32px; border-radius: 4px;">
          <tr>
            <td style="border-bottom: 2px solid #11110f; padding-bottom: 16px;">
              <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; color: #11110f;">RETRO BOUTIQUE</h1>
              <p style="margin: 4px 0 0; font-size: 13px; color: #6f6c65;">Нова резервација за подигање во продавница</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0 16px;">
              <div style="background-color: #fcfbf9; border: 1px solid #e8e3d8; padding: 16px; border-radius: 4px;">
                <p style="margin: 0 0 8px; font-size: 14px;"><strong>Број на резервација:</strong> <span style="font-size: 16px; font-weight: 700; color: #ff5a1f;">${reservation.reservation_number}</span></p>
                <p style="margin: 0 0 6px; font-size: 14px;"><strong>Купувач:</strong> ${reservation.customer_name}</p>
                <p style="margin: 0 0 6px; font-size: 14px;"><strong>Телефон:</strong> <a href="tel:${reservation.customer_phone}" style="color: #11110f; font-weight: 600;">${reservation.customer_phone}</a></p>
                ${reservation.customer_email ? `<p style="margin: 0; font-size: 14px;"><strong>Е-пошта:</strong> ${reservation.customer_email}</p>` : ''}
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px 0;">
              <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px; color: #6f6c65;">Резервирани производи:</h2>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 14px;">
                <thead>
                  <tr style="border-bottom: 2px solid #11110f; font-size: 12px; color: #6f6c65; text-transform: uppercase;">
                    <th align="left" style="padding-bottom: 8px;">Производ</th>
                    <th align="center" style="padding-bottom: 8px;">Големина</th>
                    <th align="center" style="padding-bottom: 8px;">Количина</th>
                    <th align="right" style="padding-bottom: 8px;">Цена</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding-top: 16px; font-size: 15px; font-weight: 700; text-align: right;">Вкупно за наплата:</td>
                    <td style="padding-top: 16px; font-size: 16px; font-weight: 700; color: #11110f; text-align: right;">${formatPrice(reservation.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 0 10px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 6px; font-size: 13px; color: #6f6c65;"><strong>Локација за подигање:</strong> Retro Boutique, Stiv Naumov 8, Prilep</p>
              <p style="margin: 0 0 16px; font-size: 12px; color: #888888;">* Плаќањето се врши во продавницата при подигнување.</p>
              
              <div style="text-align: center; margin-top: 20px;">
                <a href="${adminUrl}" style="display: inline-block; background-color: #11110f; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                  Отвори во Админ Панел &rarr;
                </a>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const { error } = await resend.emails.send({
      from: 'Retro Boutique <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `Нова Retro резервација – ${reservation.reservation_number}`,
      html: htmlContent,
    });

    if (error) {
      console.error('[Resend Error]', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Resend Exception]', err);
    return { success: false, error: err.message || 'Failed to send email' };
  }
}
