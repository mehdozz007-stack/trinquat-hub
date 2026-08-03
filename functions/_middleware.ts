export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // In development, let API requests go through to the functions (via [[path]].ts)
  // In production, they would be handled directly by the worker
  if (url.pathname.startsWith('/api/')) {
    // During development with wrangler pages dev, the [[path]].ts function will handle this
    // During production, the API would be handled differently
    // For now, let's pass through to the next handler
    return context.next();
  }

  // Allow image proxy and static assets to be served normally
  if (url.pathname.startsWith('/uploads/') || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/public/') || url.pathname.match(/\.(css|js|json|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
    return context.next();
  }

  // For all other requests (pages, routes), serve maintenance page
  try {
    const maintenanceUrl = new URL('/maintenance.html', request.url);
    const response = await fetch(maintenanceUrl.toString());
    return new Response(response.body, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (e) {
    console.error('Error serving maintenance page:', e);
    return new Response('Site en cours de construction', { status: 200 });
  }
}
