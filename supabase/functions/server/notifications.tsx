// Fast2SMS notification handler
import * as kv from './kv_store.tsx';

interface NotificationSettings {
  smsEnabled: boolean;
  apiKey: string;
  route: 'transactional' | 'promotional'; // Fast2SMS routes (UI facing)
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

interface SendResult {
  success: boolean;
  error?: string;
  responseData?: any;
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
  uiRoute: 'transactional' | 'promotional' = 'promotional'
): Promise<SendResult> {
  try {
    // Fast2SMS API endpoint
    const url = 'https://www.fast2sms.com/dev/bulkV2';

    // Clean phone number (remove + and country code if present)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('91') && cleanPhone.length > 10) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    // Validate phone length (10 digits for India)
    if (cleanPhone.length !== 10) {
      return { 
        success: false, 
        error: `Invalid phone number length: ${cleanPhone.length} digits. Expecting 10.` 
      };
    }

    // Map UI route to API route
    // Fast2SMS V2 routes: 'q' (Quick/Promotional), 'otp', 'dlt_manual' (v3/Transactional)
    // We map 'promotional' -> 'q' and 'transactional' -> 'dlt_manual' (or 'v3')
    // NOTE: Many users actually use 'q' for everything unless they have strict DLT templates.
    // If the user selects 'transactional', we'll try 'dlt_manual' (v3) which requires sender_id usually, 
    // but the current settings don't have sender_id.
    // However, looking at common integration patterns, 'transactional' often implies 'v3' in Fast2SMS v2.
    // But 'q' is the safest default for "Promotional" or "Quick".
    
    // Let's use 'q' for promotional and 'dlt' for transactional if user insists, 
    // but without a sender_id, 'dlt' might fail.
    // For now, let's map 'promotional' to 'q'.
    // If the user selected 'transactional', they likely expect Service Implicit/Explicit.
    // Fast2SMS often accepts 'v3' for that.
    
    let apiRoute = 'q'; // Default to Quick
    if (uiRoute === 'transactional') {
       // If no sender_id is provided in settings (which we don't have in the interface above yet), 
       // we might default to 'q' or try 'dlt_manual' if we had a sender_id.
       // Since we don't have sender_id in the interface, using 'q' is safer as it uses Fast2SMS default sender ID.
       // However, to respect the setting, let's assume 'v3' is what they want if they selected transactional.
       // BUT, v3 requires sender_id. 
       // If we assume the user just wants it to work, 'q' is the best bet.
       // Let's stick with 'q' (Quick SMS) for both for now, unless we add sender_id support.
       // Wait, the user might be testing on a DLT route.
       // Let's try to infer: 'q' is Quick SMS. 
       apiRoute = 'q'; 
    }
    
    // UPDATE: The user reported "Failed to send".
    // It's possible the route parameter was sent as 'promotional' or 'transactional' string 
    // which Fast2SMS rejected.
    
    // Prepare request body
    const body: any = {
      route: 'q', // Force 'q' (Quick SMS) for now as it's the most common for testing without DLT setup
      numbers: cleanPhone,
      message: message,
      flash: 0, // 0 = normal SMS, 1 = flash SMS
      language: 'english',
    };

    // Convert to URL-encoded format
    const formData = new URLSearchParams(body);

    console.log('Sending Fast2SMS request:', { route: 'q', numbers: cleanPhone, messageLength: message.length });

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
        return { 
          success: false, 
          error: responseData.message ? JSON.stringify(responseData.message) : 'Unknown error from Fast2SMS',
          responseData 
        };
      }

      console.log('SMS sent successfully via Fast2SMS:', responseData);
      return { success: true, responseData };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    console.error('Error sending SMS via Fast2SMS:', error);
    return { success: false, error: error.message || String(error) };
  }
}

// Main notification sender
export async function sendNotification(
  phone: string,
  message: string,
  settings: NotificationSettings
): Promise<SendResult> {
  if (!settings.smsEnabled) {
    console.log('SMS notifications are disabled');
    return { success: false, error: 'SMS notifications are disabled in settings' };
  }

  const { apiKey, route } = settings;

  if (!apiKey) {
    console.error('Fast2SMS API key not configured');
    return { success: false, error: 'Fast2SMS API key is missing' };
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