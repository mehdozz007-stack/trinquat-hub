export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // If this is an API request, forward to the Worker
  if (url.pathname.startsWith('/api/')) {
    const workerUrl = new URL(
      url.pathname + url.search,
      'https://trinquat-compagnie.mehdozz007.workers.dev'
    );

    const response = await fetch(workerUrl.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.arrayBuffer() : undefined,
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  // Serve maintenance page for all other requests
  if (url.pathname === '/' || url.pathname === '') {
    try {
      const maintenanceUrl = new URL('/maintenance.html', request.url);
      const response = await fetch(maintenanceUrl.toString());
      return new Response(response.body, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    } catch (e) {
      return new Response('Site en cours de construction', { status: 200 });
    }
  }

  // Otherwise, proceed with normal Pages serving
  return context.next();
}
