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

    const itemsRowsHtml = order.items
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 8px; font-size: 13px; color: #1e293b;">
            <strong style="display: block; font-weight: 700;">${item.product.title}</strong>
            <span style="font-size: 11px; color: #059669; font-weight: 600;">Variant/Color: ${item.selectedSize}</span>
          </td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: center; color: #475569;">${item.quantity}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; color: #475569;">LKR ${item.product.sellingPrice.toLocaleString()}</td>
          <td style="padding: 10px 8px; font-size: 13px; text-align: right; font-weight: 700; color: #064e3b;">LKR ${(item.product.sellingPrice * item.quantity).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Alert - NookMint</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #064E3B 0%, #047857 100%); padding: 24px; color: #ffffff; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; margin-bottom: 4px;">NookMint Order Alert</div>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800;">🔔 New Customer Order #${order.orderNumber}</h1>
          <div style="margin-top: 6px; font-size: 13px; opacity: 0.85;">Placed on: ${new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div style="padding: 24px;">

          <!-- Customer Details Box -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #064E3B; font-weight: 800;">👤 Customer Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="padding: 4px 0; color: #64748b; width: 140px;"><strong>Customer Name:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 600;">${customer.fullName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>WhatsApp Mobile:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">
                  ${customer.phone}
                  ${waLink ? `&nbsp;(<a href="${waLink}" style="color: #059669; text-decoration: underline;">Chat on WhatsApp</a>)` : ''}
                </td>
              </tr>
              ${
                customer.alternatePhone
                  ? `<tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Backup Mobile:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${customer.alternatePhone}</td>
              </tr>`
                  : ''
              }
              ${
                customer.email
                  ? `<tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Email / Gmail:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${customer.email}</td>
              </tr>`
                  : ''
              }
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Delivery Address:</strong></td>
                <td style="padding: 4px 0; color: #0f172a;">${customer.addressLine1}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>District & City:</strong></td>
                <td style="padding: 4px 0; color: #0f172a; font-weight: 700;">${customer.district || 'Colombo'} (${customer.city})</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; color: #64748b;"><strong>Payment Mode:</strong></td>
                <td style="padding: 4px 0; color: #064e3b; font-weight: 800;">100% Cash on Delivery (COD)</td>
              </tr>
            </table>
          </div>

          <!-- Order Items Table -->
          <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #064E3B; font-weight: 800;">📦 Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0; text-align: left;">
                <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #64748b;">Product & Variant</th>
                <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: center;">Qty</th>
                <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: right;">Unit Price</th>
                <th style="padding: 8px; font-size: 11px; text-transform: uppercase; color: #64748b; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <!-- Financial Summary -->
          <div style="border-top: 2px dashed #cbd5e1; padding-top: 14px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; color: #64748b;">
              <span>Courier Delivery Fee:</span>
              <strong style="color: #d97706;">Invoiced on WhatsApp</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #064E3B; padding-top: 4px;">
              <span>Total Payable Amount:</span>
              <span>LKR ${order.grandTotal.toLocaleString()}.00</span>
            </div>
          </div>

          <!-- Quick Action Buttons -->
          <div style="text-align: center; margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
            ${
              waLink
                ? `<a href="${waLink}" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px; margin-right: 8px;">📲 Message Customer on WhatsApp</a>`
                : ''
            }
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin" style="display: inline-block; background: #064E3B; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; padding: 12px 24px; border-radius: 12px;">📊 Open Admin Orders</a>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          This automatic notification was dispatched by <strong>NookMint Dropship & Storefront System</strong> to <strong>${adminEmail}</strong>.
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
