// SMS and WhatsApp notification handler
import * as kv from './kv_store.tsx';

interface NotificationSettings {
  smsEnabled: boolean;
  whatsappEnabled: boolean;
  provider: string;
  apiKey: string;
  apiSecret: string;
  senderId: string;
  webhookUrl: string;
  adminPhone: string;
  notifyOnNewOrder: boolean;
  notifyOnStatusChange: boolean;
  notifyAdminOnOrder: boolean;
  orderPlacedTemplate: string;
  orderShippedTemplate: string;
  orderDeliveredTemplate: string;
  orderCancelledTemplate: string;
  adminOrderTemplate: string;
}

// Template variable replacement
function replaceTemplateVariables(
  template: string,
  variables: { [key: string]: string }
): string {
  let message = template;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    message = message.replace(regex, variables[key]);
  });
  return message;
}

// Send SMS via Twilio
async function sendViaTwilio(
  phone: string,
  message: string,
  apiKey: string,
  apiSecret: string,
  senderId: string
): Promise<boolean> {
  try {
    const accountSid = apiKey;
    const authToken = apiSecret;
    const from = senderId;

    const credentials = btoa(`${accountSid}:${authToken}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      From: from,
      To: phone,
      Body: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio SMS error:', errorText);
      return false;
    }

    console.log('SMS sent successfully via Twilio');
    return true;
  } catch (error) {
    console.error('Error sending SMS via Twilio:', error);
    return false;
  }
}

// Send SMS via MSG91
async function sendViaMSG91(
  phone: string,
  message: string,
  apiKey: string,
  senderId: string
): Promise<boolean> {
  try {
    const url = 'https://api.msg91.com/api/v5/flow/';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'authkey': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: senderId,
        route: '4',
        country: '91',
        sms: [
          {
            message: message,
            to: [phone],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MSG91 SMS error:', errorText);
      return false;
    }

    console.log('SMS sent successfully via MSG91');
    return true;
  } catch (error) {
    console.error('Error sending SMS via MSG91:', error);
    return false;
  }
}

// Send SMS via Textlocal
async function sendViaTextlocal(
  phone: string,
  message: string,
  apiKey: string,
  senderId: string
): Promise<boolean> {
  try {
    const url = 'https://api.textlocal.in/send/';

    const body = new URLSearchParams({
      apikey: apiKey,
      sender: senderId,
      numbers: phone,
      message: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Textlocal SMS error:', errorText);
      return false;
    }

    console.log('SMS sent successfully via Textlocal');
    return true;
  } catch (error) {
    console.error('Error sending SMS via Textlocal:', error);
    return false;
  }
}

// Send via custom webhook
async function sendViaCustomWebhook(
  phone: string,
  message: string,
  webhookUrl: string,
  apiKey: string
): Promise<boolean> {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Custom webhook error:', errorText);
      return false;
    }

    console.log('Notification sent successfully via custom webhook');
    return true;
  } catch (error) {
    console.error('Error sending notification via custom webhook:', error);
    return false;
  }
}

// Send WhatsApp via Twilio
async function sendWhatsAppViaTwilio(
  phone: string,
  message: string,
  apiKey: string,
  apiSecret: string,
  senderId: string
): Promise<boolean> {
  try {
    const accountSid = apiKey;
    const authToken = apiSecret;
    const from = `whatsapp:${senderId}`;
    const to = `whatsapp:${phone}`;

    const credentials = btoa(`${accountSid}:${authToken}`);
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams({
      From: from,
      To: to,
      Body: message,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio WhatsApp error:', errorText);
      return false;
    }

    console.log('WhatsApp message sent successfully via Twilio');
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp via Twilio:', error);
    return false;
  }
}

// Main notification sender
export async function sendNotification(
  phone: string,
  message: string,
  settings: NotificationSettings,
  type: 'sms' | 'whatsapp' = 'sms'
): Promise<boolean> {
  const { provider, apiKey, apiSecret, senderId, webhookUrl } = settings;

  if (type === 'whatsapp' && settings.whatsappEnabled) {
    // WhatsApp is primarily supported via Twilio
    if (provider === 'twilio') {
      return await sendWhatsAppViaTwilio(phone, message, apiKey, apiSecret, senderId);
    } else if (provider === 'custom') {
      return await sendViaCustomWebhook(phone, message, webhookUrl, apiKey);
    } else {
      console.log('WhatsApp not supported with selected provider');
      return false;
    }
  } else if (type === 'sms' && settings.smsEnabled) {
    switch (provider) {
      case 'twilio':
        return await sendViaTwilio(phone, message, apiKey, apiSecret, senderId);
      case 'msg91':
        return await sendViaMSG91(phone, message, apiKey, senderId);
      case 'textlocal':
        return await sendViaTextlocal(phone, message, apiKey, senderId);
      case 'custom':
        return await sendViaCustomWebhook(phone, message, webhookUrl, apiKey);
      default:
        console.error('Unknown SMS provider:', provider);
        return false;
    }
  }

  return false;
}

// Send order placed notification
export async function sendOrderPlacedNotification(
  orderDetails: any,
  customerPhone: string,
  customerName: string
): Promise<void> {
  try {
    const settings = await kv.get<NotificationSettings>('notification_settings');
    if (!settings || (!settings.smsEnabled && !settings.whatsappEnabled)) {
      console.log('Notifications are disabled');
      return;
    }

    if (!settings.notifyOnNewOrder) {
      console.log('New order notifications are disabled');
      return;
    }

    const variables = {
      customerName: customerName,
      orderId: orderDetails.id || orderDetails.orderNumber,
      amount: orderDetails.total?.toString() || '0',
      storeName: 'Radha Sarees',
      trackingUrl: `https://radhasarees.com/orders/${orderDetails.id}`,
    };

    const message = replaceTemplateVariables(
      settings.orderPlacedTemplate,
      variables
    );

    // Send to customer
    if (settings.smsEnabled) {
      await sendNotification(customerPhone, message, settings, 'sms');
    }
    if (settings.whatsappEnabled) {
      await sendNotification(customerPhone, message, settings, 'whatsapp');
    }

    // Send to admin
    if (settings.notifyAdminOnOrder) {
      const adminMessage = replaceTemplateVariables(
        settings.adminOrderTemplate,
        {
          ...variables,
          customerPhone: customerPhone,
        }
      );

      if (settings.smsEnabled) {
        await sendNotification(settings.adminPhone, adminMessage, settings, 'sms');
      }
      if (settings.whatsappEnabled) {
        await sendNotification(settings.adminPhone, adminMessage, settings, 'whatsapp');
      }
    }
  } catch (error) {
    console.error('Error sending order placed notification:', error);
  }
}

// Send order status change notification
export async function sendOrderStatusNotification(
  orderDetails: any,
  customerPhone: string,
  customerName: string,
  newStatus: string
): Promise<void> {
  try {
    const settings = await kv.get<NotificationSettings>('notification_settings');
    if (!settings || (!settings.smsEnabled && !settings.whatsappEnabled)) {
      console.log('Notifications are disabled');
      return;
    }

    if (!settings.notifyOnStatusChange) {
      console.log('Status change notifications are disabled');
      return;
    }

    const variables = {
      customerName: customerName,
      orderId: orderDetails.id || orderDetails.orderNumber,
      amount: orderDetails.total?.toString() || '0',
      storeName: 'Radha Sarees',
      trackingUrl: `https://radhasarees.com/orders/${orderDetails.id}`,
    };

    let template = settings.orderPlacedTemplate; // default

    // Select appropriate template based on status
    if (newStatus === 'Shipped') {
      template = settings.orderShippedTemplate;
    } else if (newStatus === 'Delivered') {
      template = settings.orderDeliveredTemplate;
    } else if (newStatus === 'Cancelled') {
      template = settings.orderCancelledTemplate;
    }

    const message = replaceTemplateVariables(template, variables);

    // Send to customer only (not admin for status changes)
    if (settings.smsEnabled) {
      await sendNotification(customerPhone, message, settings, 'sms');
    }
    if (settings.whatsappEnabled) {
      await sendNotification(customerPhone, message, settings, 'whatsapp');
    }
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
}
