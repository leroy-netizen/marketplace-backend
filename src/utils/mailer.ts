import nodemailer from "nodemailer";
import { renderEmailTemplate } from "./template";
import logger from "./logger";

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send OTP email for password reset
 */
export const sendOTPEmail = async (email: string, otp: string) => {
  try {
    const transporter = createTransporter();

    // Render the OTP email template
    const html = renderEmailTemplate("otp", { otp });

    const mailOptions = {
      from: `"Marketplace Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP is ${otp}. It expires in 5 minutes.`,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`, { messageId: result.messageId });
    return result;
  } catch (error: any) {
    logger.error(`Failed to send OTP email to ${email}`, {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Send a generic email
 */
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Marketplace" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}`, {
      subject,
      messageId: result.messageId,
    });
    return result;
  } catch (error: any) {
    logger.error(`Failed to send email to ${to}`, {
      subject,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Send order confirmation email
 */
export const sendOrderConfirmationEmail = async (
  email: string,
  name: string,
  orderId: string,
  total: number,
  orderItems: any[]
) => {
  try {
    const orderSummaryHtml = `
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems
            .map(
              (item) => `
            <tr>
              <td>${item.product.title}</td>
              <td>${item.quantity}</td>
              <td>$${item.unitPrice.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;

    const html = renderEmailTemplate("order-confirmation", {
      name,
      orderId,
      orderDate: new Date().toLocaleDateString(),
      total: total.toFixed(2),
      orderSummary: orderSummaryHtml,
      trackingUrl: `${process.env.API_URL}/orders/${orderId}`,
    });

    return await sendEmail(email, "Your Order Confirmation", html);
  } catch (error: any) {
    logger.error(`Failed to send order confirmation email to ${email}`, {
      orderId,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Send order status update email
 */
export const sendOrderStatusUpdateEmail = async (
  email: string,
  name: string,
  orderId: string,
  productTitle: string,
  status: string,
  trackingNumber?: string
) => {
  try {
    // Render the order status update template
    const html = renderEmailTemplate("order-status-update", {
      name,
      orderId,
      productTitle,
      status,
      trackingNumber,
      trackingUrl: trackingNumber
        ? `https://trackingservice.com/${trackingNumber}`
        : undefined,
      orderUrl: `${process.env.API_URL}/orders/${orderId}`,
    });

    return await sendEmail(
      email,
      `Order Status Update: ${status.toUpperCase()}`,
      html
    );
  } catch (error: any) {
    logger.error(`Failed to send order status update email to ${email}`, {
      orderId,
      status,
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
