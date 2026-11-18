import nodemailer from 'nodemailer';
import { Order } from '@/core/entities/Order';

const DEFAULT_ADMIN_EMAIL = 'mohamednasik050301@gmail.com';

export class EmailNotificationService {
  private static transporter: any = null;

  private static getTransporter(): any {
    if (this.transporter) return this.transporter;

    const user = (process.env.GMAIL_USER || process.env.EMAIL_SERVER_USER || DEFAULT_ADMIN_EMAIL).trim();
    const rawPass = process.env.GMAIL_APP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD || '';
    const pass = rawPass.replace(/\s+/g, '');

    if (!pass) {
      return null;
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });

    return this.transporter;
  }

  public static async sendNewOrderAlert(order: Order): Promise<{ success: boolean; message: string }> {
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;
    const customer = order.shippingAddress;
    const cleanPhone = (customer.phone || '').replace(/[^0-9]/g, '').replace(/^0/, '94');
    const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : '';

    const itemsCardsHtml = order.items
      .map(
        (item) => `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 10px;">
          <div style="font-size: 13px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 4px;">
            ${item.product.title}
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 700; margin-bottom: 8px;">
            Option / Color: ${item.selectedSize}
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
            <tr>
              <td style="color: #64748b; padding: 0;">
                Qty: <strong style="color: #0f172a;">${item.quantity}</strong> &times; LKR ${item.product.sellingPrice.toLocaleString()}
              </td>
              <td style="text-align: right; font-weight: 800; color: #064E3B; font-size: 13px; padding: 0;">
                LKR ${(item.product.sellingPrice * item.quantity).toLocaleString()}.00
              </td>
            </tr>
          </table>
        </div>
      `
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Alert - NookMint</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 12px; color: #1e293b; -webkit-text-size-adjust: 100%;">
      <div style="max-width: 520px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #064E3B 0%, #047857 100%); padding: 20px; color: #ffffff; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; margin-bottom: 4px;">NookMint Order Alert</div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 800; line-height: 1.3;">🔔 New Customer Order #${order.orderNumber}</h1>
          <div style="margin-top: 6px; font-size: 12px; opacity: 0.85;">Placed on: ${new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div style="padding: 16px 20px;">

          <!-- Customer Details Box (Mobile-Responsive Stacked Layout) -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
            <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #064E3B; font-weight: 800;">👤 Customer Details</h3>
            
            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Customer Name</div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">${customer.fullName}</div>
            </div>

            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">WhatsApp Mobile</div>
              <div style="font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px;">
                ${customer.phone}
                ${waLink ? `
                  <div style="margin-top: 6px;">
                    <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 6px; text-decoration: none;">💬 Chat on WhatsApp</a>
                  </div>
                ` : ''}
              </div>
            </div>

            ${customer.alternatePhone ? `
            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Backup Mobile</div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px;">${customer.alternatePhone}</div>
            </div>
            ` : ''}

            ${customer.email ? `
            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Email / Gmail</div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; word-break: break-all;">
                <a href="mailto:${customer.email}" style="color: #0284c7; text-decoration: none;">${customer.email}</a>
              </div>
            </div>
            ` : ''}

            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Delivery Address</div>
              <div style="font-size: 13px; font-weight: 600; color: #0f172a; margin-top: 2px; line-height: 1.4;">${customer.addressLine1}</div>
            </div>

            <div style="padding: 6px 0; border-bottom: 1px solid #e2e8f0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">District &amp; City</div>
              <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-top: 2px;">${customer.district || 'Colombo'} (${customer.city})</div>
            </div>

            <div style="padding: 6px 0 2px 0;">
              <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Payment Mode</div>
              <div style="font-size: 13px; font-weight: 800; color: #064E3B; margin-top: 2px;">100% Cash on Delivery (COD)</div>
            </div>

          </div>

          <!-- Order Items -->
          <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #064E3B; font-weight: 800;">📦 Ordered Items</h3>
          ${itemsCardsHtml}

          <!-- Financial Summary Table -->
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-top: 14px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Product(s) Total:</td>
                <td style="padding: 4px 0; color: #0f172a; text-align: right; font-weight: 700;">LKR ${order.subtotal.toLocaleString()}.00</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;">Courier Delivery Fee:</td>
                <td style="padding: 4px 0; color: #d97706; text-align: right; font-weight: 700;">
                  Invoiced via WhatsApp
                </td>
              </tr>
              <tr>
                <td colspan="2" style="padding-top: 6px;"><div style="border-top: 1px dashed #cbd5e1;"></div></td>
              </tr>
              <tr>
                <td style="padding: 8px 0 2px 0; font-size: 14px; font-weight: 800; color: #064E3B;">Total Order Value:</td>
                <td style="padding: 8px 0 2px 0; font-size: 16px; font-weight: 900; color: #064E3B; text-align: right;">LKR ${order.grandTotal.toLocaleString()}.00</td>
              </tr>
            </table>
          </div>

          <!-- Quick Action Buttons (Full-Width Responsive Stack) -->
          <table style="width: 100%; border-collapse: collapse; margin-top: 18px;">
            ${waLink ? `
            <tr>
              <td style="padding-bottom: 8px;">
                <a href="${waLink}" style="display: block; width: 100%; box-sizing: border-box; background: #25D366; color: #ffffff; text-align: center; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 16px; border-radius: 10px;">📲 Message Customer on WhatsApp</a>
              </td>
            </tr>
            ` : ''}
            <tr>
              <td>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://nook-mint.vercel.app'}/admin" style="display: block; width: 100%; box-sizing: border-box; background: #064E3B; color: #ffffff; text-align: center; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 16px; border-radius: 10px;">📊 Open Admin Orders</a>
              </td>
            </tr>
          </table>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 14px 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Dispatched by <strong>NookMint Dropship &amp; Storefront System</strong> to <strong>${adminEmail}</strong>
        </div>

      </div>
    </body>
    </html>
    `;

    const subject = `🌿 New Order Alert: #${order.orderNumber} - ${customer.fullName} (LKR ${order.grandTotal.toLocaleString()})`;
    const text = `New order #${order.orderNumber} received from ${customer.fullName} (${customer.phone}) for LKR ${order.grandTotal.toLocaleString()}. Delivery to ${customer.addressLine1}, ${customer.district || 'Colombo'}.`;

    // 1. High-speed REST API (Resend) if configured (supports all edge & serverless platforms)
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'NookMint Store <onboarding@resend.dev>',
            to: [adminEmail],
            subject,
            text,
            html: htmlContent,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          console.log(`[EmailNotificationService] Email sent via Resend REST API to ${adminEmail}. Id: ${data?.id}`);
          return { success: true, message: `Email delivered to ${adminEmail}` };
        }
      } catch (resendErr) {
        console.error('[EmailNotificationService] Resend API attempt failed, trying Gmail SMTP:', resendErr);
      }
    }

    // 2. Direct Google Gmail SMTP Transport
    const transporter = this.getTransporter();

    if (!transporter) {
      console.log(`\n============================================================`);
      console.log(`📧 [ORDER EMAIL NOTIFICATION DISPATCHED]`);
      console.log(`To: ${adminEmail}`);
      console.log(`Subject: ${subject}`);
      console.log(`Customer: ${customer.fullName} | Mobile: ${customer.phone}`);
      console.log(`District: ${customer.district || 'Colombo'} (${customer.city})`);
      console.log(`Address: ${customer.addressLine1}`);
      console.log(`Items (${order.items.length}): ${order.items.map((i) => `${i.product.title} (${i.selectedSize}) x${i.quantity}`).join(', ')}`);
      console.log(`Total: LKR ${order.grandTotal.toLocaleString()}`);
      console.log(`Tip: To deliver live emails to your Gmail inbox, add GMAIL_APP_PASSWORD to your .env.local file.`);
      console.log(`============================================================\n`);

      return {
        success: true,
        message: 'Order email logged (Pending GMAIL_APP_PASSWORD in .env.local for live SMTP delivery).',
      };
    }

    try {
      const info = await transporter.sendMail({
        from: `"NookMint Store" <${process.env.GMAIL_USER || adminEmail}>`,
        to: adminEmail,
        subject,
        text,
        html: htmlContent,
      });

      console.log(`[EmailNotificationService] Email sent successfully to ${adminEmail}. MessageId: ${info.messageId}`);
      return { success: true, message: `Email delivered to ${adminEmail}` };
    } catch (err: any) {
      console.error('[EmailNotificationService] Failed to send email via SMTP:', err);
      return { success: false, message: err.message };
    }
  }
}
