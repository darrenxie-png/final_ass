const checkNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  return Notification.permission === 'granted';
};

export const initializeNotification = async () => {
  if (!('Notification' in window)) {
    console.log('Browser tidak mendukung notifikasi');
    return false;
  }

  if (Notification.permission === 'default') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return false;
    }
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID key
    });

    console.log('Notification subscription:', subscription);
    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};

export const subscribePushNotification = async () => {
  try {
    const supported = await checkNotificationPermission();
    if (!supported) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY'
    });

    console.log('Push Notification berhasil diaktifkan:', subscription);
    return true;
  } catch (error) {
    console.error('Gagal mengaktifkan notifikasi:', error);
    return false;
  }
};

// You can also export other notification-related functions if needed
export const showNotification = async (title, options) => {
  if (Notification.permission === 'granted') {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, options);
  }
};