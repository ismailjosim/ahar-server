/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'node:path';

import ejs from 'ejs';

import { transporter } from '@/config/email.config';
import { envVars } from '@/config/env';
import AppError from '@/helpers/AppError';
import StatusCode from '@/utils/statusCode';

const RESTAURANT_NAME = 'আহার';

// send mail interface
interface ISendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData?: Record<string, any>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendMail = async ({
  to,
  subject,
  templateName,
  templateData,
  attachments,
}: ISendEmailOptions) => {
  if (!envVars.EMAIL_SENDER.SMTP_USER) {
    console.warn('[Email] SMTP not configured. Skipping email:', subject);
    return;
  }

  try {
    const templatePath = path.join(__dirname, `templates/${templateName}.ejs`);
    const html = await ejs.renderFile(templatePath, templateData);

    const info = await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to,
      subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    if (envVars.NODE_ENV === 'development') {
      console.log(`✉️ Email sent to ${to}: ${info.messageId}`);
    }
  } catch (error: any) {
    if (envVars.NODE_ENV === 'development') {
      console.error('Found Error while sending email: ', error);
      if (error.responseCode) {
        console.error('Nodemailer Response Code:', error.responseCode);
      }
      if (error.response) {
        console.error('Nodemailer Response:', error.response);
      }
      if (error.command) {
        console.error('Nodemailer Command:', error.command);
      }
    }
    throw new AppError(
      StatusCode.BAD_REQUEST,
      'Email Error: Authentication failed or SMTP configuration issue.',
    );
  }
};

export const EmailService = {
  async sendOrderConfirmation(order: {
    customerName: string;
    email: string;
    id: string;
    items: Array<{ name: string; quantity: number; lineTotal: number }>;
    total: number;
    fulfillmentType: string;
    paymentMethod: string;
  }) {
    await sendMail({
      to: order.email,
      subject: `${RESTAURANT_NAME} — Order Confirmed #${order.id.slice(0, 8).toUpperCase()}`,
      templateName: 'order-confirmation',
      templateData: {
        order,
        restaurantName: RESTAURANT_NAME,
        frontendUrl: envVars.FRONTEND_URL,
      },
    });
  },

  async sendOrderStatusUpdate(order: {
    customerName: string;
    email: string;
    id: string;
    status: string;
  }) {
    await sendMail({
      to: order.email,
      subject: `${RESTAURANT_NAME} — Your order is ${order.status}`,
      templateName: 'order-status',
      templateData: {
        order,
        restaurantName: RESTAURANT_NAME,
        frontendUrl: envVars.FRONTEND_URL,
      },
    });
  },

  async sendReservationConfirmation(reservation: {
    customerName: string;
    email?: string | null;
    phone: string;
    id: string;
    guests: number;
    displayTime: string;
    tableCode?: string | null;
  }) {
    if (!reservation.email) return; // no email provided
    await sendMail({
      to: reservation.email,
      subject: `${RESTAURANT_NAME} — Reservation Confirmed #${reservation.id.slice(0, 8).toUpperCase()}`,
      templateName: 'reservation-confirmation',
      templateData: {
        reservation,
        restaurantName: RESTAURANT_NAME,
      },
    });
  },

  async sendReservationStatusUpdate(reservation: {
    customerName: string;
    email?: string | null;
    id: string;
    status: string;
  }) {
    if (!reservation.email) return;
    await sendMail({
      to: reservation.email,
      subject: `${RESTAURANT_NAME} — Reservation ${reservation.status}`,
      templateName: 'reservation-status',
      templateData: {
        reservation,
        restaurantName: RESTAURANT_NAME,
      },
    });
  },

  async sendStaffInvite(invite: {
    email: string;
    role: string;
    token: string;
    inviterName: string;
  }) {
    await sendMail({
      to: invite.email,
      subject: `${RESTAURANT_NAME} — You've been invited as ${invite.role}`,
      templateName: 'staff-invite',
      templateData: {
        invite,
        restaurantName: RESTAURANT_NAME,
        signupUrl: `${envVars.FRONTEND_URL}/auth/signup?invite=${invite.token}`,
      },
    });
  },
};
