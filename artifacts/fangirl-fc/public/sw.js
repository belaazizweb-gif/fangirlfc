const CACHE_NAME = "fangirl-fc-v1";

const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-192.png",
  "/icons/icon-maskable-512.png",
];

// ── Install — cache app shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
  self.skipWaiting();
});

// ── Activate — clean old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function shouldSkip(url) {
  const href = url.href;

  // Non-GET handled outside (SW only sees GET here, but guard anyway)
  if (!href) return true;

  // Firebase / Google auth / Firestore
  if (
    href.includes("firebaseio.com") ||
    href.includes("firestore.googleapis.com") ||
    href.includes("identitytoolkit.googleapis.com") ||
    href.includes("securetoken.googleapis.com") ||
    href.includes("accounts.google.com") ||
    href.includes("googleapis.com") ||
    href.includes("firebase") ||
    href.includes("gstatic.com")
  ) return true;

  // Hugging Face / CDN model downloads
  if (
    href.includes("huggingface.co") ||
    href.includes("hf.co") ||
    href.includes("cdn-lfs") ||
    href.includes(".onnx") ||
    href.includes(".bin")
  ) return true;

  // Blob / data URIs
  if (url.protocol === "blob:" || url.protocol === "data:") return true;

  // Non-same-origin
  if (url.origin !== self.location.origin) return true;

  return false;
}

function isStaticAsset(url) {
  const pathname = url.pathname;
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/icons/") ||
    pathname === "/icon.svg" ||
    pathname === "/manifest.json"
  );
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Skip Firebase, Google, HuggingFace, cross-origin, etc.
  if (shouldSkip(url)) return;

  const isNavigation = request.mode === "navigate";

  if (isNavigation) {
    // Network-first for navigation; fall back to offline.html
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() =>
          caches.match("/offline.html").then(
            (cached) => cached || new Response("Offline", { status: 503 })
          )
        )
    );
    return;
  }

  if (isStaticAsset(url)) {
    // Cache-first for static assets (Next.js hashed chunks, icons, manifest)
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        }).catch(() => new Response("", { status: 503 }));
      })
    );
    return;
  }

  // Everything else: network-only (no caching)
});
