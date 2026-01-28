// Fast2SMS notification handler
import * as kv from './kv_store.tsx';

interface NotificationSettings {
  smsEnabled: boolean;
  apiKey: string;
  route: 'transactional' | 'promotional'; // Fast2SMS routes
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

// Send SMS via Fast2SMS
async function sendViaFast2SMS(
  phone: string,
  message: string,
  apiKey: string,
  route: 'transactional' | 'promotional' = 'promotional'
): Promise<boolean> {
  try {
    // Fast2SMS API endpoint
    const url = 'https://www.fast2sms.com/dev/bulkV2';

    // Clean phone number (remove + and country code if present)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }

    // Prepare request body
    const body: any = {
      route: route, // 'transactional' or 'promotional'
      numbers: cleanPhone,
      message: message,
      flash: 0, // 0 = normal SMS, 1 = flash SMS
      language: 'english',
    };

    // Convert to URL-encoded format
    const formData = new URLSearchParams(body);

    console.log('Sending Fast2SMS request:', { route, numbers: cleanPhone, messageLength: message.length });

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'authorization': apiKey, // Fast2SMS uses authorization header
        },
        body: formData.toString(),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      const responseData = await response.json();

      console.log('Fast2SMS response:', responseData);

      // Check if the request was successful
      // Fast2SMS returns { "return": true, "request_id": "...", "message": [...] }
      if (!response.ok || !responseData.return) {
        console.error('Fast2SMS error:', responseData);
        return false;
      }

      console.log('SMS sent successfully via Fast2SMS:', responseData);
      return true;
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error sending SMS via Fast2SMS:', error);
    return false;
  }
}

// Main notification sender
export async function sendNotification(
  phone: string,
  message: string,
  settings: NotificationSettings
): Promise<boolean> {
  if (!settings.smsEnabled) {
    console.log('SMS notifications are disabled');
    return false;
  }

  const { apiKey, route } = settings;

  if (!apiKey) {
    console.error('Fast2SMS API key not configured');
    return false;
  }

  return await sendViaFast2SMS(phone, message, apiKey, route);
}

// Send order placed notification
export async function sendOrderPlacedNotification(
  orderDetails: any,
  customerPhone: string,
  customerName: string
): Promise<void> {
  try {
    const settings = await kv.get<NotificationSettings>('notification_settings');
    if (!settings || !settings.smsEnabled) {
      console.log('SMS notifications are disabled');
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
    await sendNotification(customerPhone, message, settings);

    // Send to admin
    if (settings.notifyAdminOnOrder && settings.adminPhone) {
      const adminMessage = replaceTemplateVariables(
        settings.adminOrderTemplate,
        {
          ...variables,
          customerPhone: customerPhone,
        }
      );

      await sendNotification(settings.adminPhone, adminMessage, settings);
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
    if (!settings || !settings.smsEnabled) {
      console.log('SMS notifications are disabled');
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
    await sendNotification(customerPhone, message, settings);
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
}