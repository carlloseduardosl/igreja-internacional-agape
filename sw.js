
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {
    title: 'Igreja Ágape',
    body: 'Temos uma nova mensagem para você!',
    icon: 'https://iili.io/f4RBYzP.jpg'
  };

  const options = {
    body: data.body,
    icon: data.icon || 'https://iili.io/f4RBYzP.jpg',
    badge: 'https://iili.io/f4RBYzP.jpg',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
