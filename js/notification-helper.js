const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  if (Notification.permission === 'denied') {
    console.log('Notifikasi diblokir');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }
};

export const subscribePushNotification = async () => {
  try {
    const supported = await checkNotificationPermission();
    if (!supported) return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_PUBLIC_VAPID_KEY'
    });

    console.log('Push Notification subscription:', subscription);
  } catch (error) {
    console.error('Gagal subscribe push notification:', error);
  }
};