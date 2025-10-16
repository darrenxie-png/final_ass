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

const registerServiceWorker = async () => {
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js');
    console.log('Service Worker berhasil didaftarkan:', registration);
    return registration;
  } catch (error) {
    console.error('Service Worker gagal didaftarkan:', error);
    throw error;
  }
};

export const initializeNotification = async () => {
  try {
    const supported = await checkNotificationPermission();
    if (!supported) return false;

    const registration = await registerServiceWorker();
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