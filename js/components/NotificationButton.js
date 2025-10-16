const NotificationButton = {
  async init() {
    const button = document.createElement('button');
    button.id = 'notifBtn';
    button.className = 'notification-btn';
    button.textContent = 'Aktifkan Notifikasi';

    button.addEventListener('click', async () => {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        await subscribePushNotification(registration);
        button.textContent = 'Notifikasi Aktif';
        button.disabled = true;
      }
    });

    return button;
  }
};

export default NotificationButton;