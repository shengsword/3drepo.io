const CACHE_NAME = 'externalResources';

self.addEventListener('fetch', function (event) {
	const requestURL = new URL(event.request.url);
	if (requestURL.pathname.startsWith('/api') && event.request.destination === 'image') {
		event.respondWith(
			caches.open(CACHE_NAME).then(function (cache) {
				return cache.match(event.request).then(function (response) {
					var fetchPromise = fetch(event.request).then(function (networkResponse) {
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					})
					return response || fetchPromise;
				})
			})
		);
	}
});