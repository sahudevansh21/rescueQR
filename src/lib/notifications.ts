// Simulated Notifications Dispatcher for VitalLink AI

export interface NotificationPayload {
  recipientName: string;
  recipientPhoneOrEmail: string;
  message: string;
  type: 'sms' | 'email' | 'push';
  sentAt: string;
  status: 'sent' | 'failed';
}

export async function sendEmergencySMS(
  contactName: string,
  phoneNumber: string,
  userName: string,
  mapLink: string
): Promise<NotificationPayload> {
  const message = `URGENT: VitalLink AI scan alert. ${userName}'s emergency QR card was scanned. Live GPS location: ${mapLink}. Respond immediately.`;
  console.log(`[SMS DISPATCH] Sending to ${contactName} (${phoneNumber}): ${message}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    recipientName: contactName,
    recipientPhoneOrEmail: phoneNumber,
    message,
    type: 'sms',
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
}

export async function sendEmergencyEmail(
  emailAddress: string,
  userName: string,
  mapLink: string,
  details: string
): Promise<NotificationPayload> {
  const message = `Subject: EMERGENCY SCAN ALERT - ${userName} - VitalLink AI\n\nHello,\n\nThis is an automated alert from VitalLink AI. ${userName}'s emergency identification profile has been scanned.\n\nGPS Coordinates / Location: ${mapLink}\nScan Details: ${details}\n\nPlease check on them or coordinate with first responders immediately.`;
  console.log(`[EMAIL DISPATCH] Sending to ${emailAddress}:\n${message}`);
  
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    recipientName: 'Family Member',
    recipientPhoneOrEmail: emailAddress,
    message,
    type: 'email',
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
}

export async function sendWebPushNotification(
  userId: string,
  message: string
): Promise<NotificationPayload> {
  console.log(`[PUSH DISPATCH] Sending push to user ID ${userId}: ${message}`);
  
  return {
    recipientName: 'User Dashboard',
    recipientPhoneOrEmail: userId,
    message,
    type: 'push',
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
}
