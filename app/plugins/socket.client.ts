import { io } from "socket.io-client";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const socket = io(config.public.socketUrl, { transports: ["websocket"] });
  // Preload new-order sound
  const newOrderSound =
    typeof Audio !== "undefined" ? new Audio("/sounds/noti.wav") : null;
  if (newOrderSound) {
    newOrderSound.volume = 0.5;
  }

  let lastSoundAt = 0;
  const playNewOrderSound = () => {
    const now = Date.now();
    if (!newOrderSound) return;
    // throttle: at most once per 2s
    if (now - lastSoundAt < 2000) return;
    lastSoundAt = now;
    try {
      newOrderSound.currentTime = 0;
      newOrderSound.play().catch(() => {});
    } catch {}
  };

  socket.on("connect", () => {
    console.log('Socket connected', socket.id)
  });

  socket.on("order-created", async () => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    // increment for chef/admin only
    if (auth.user?.role === "chef" || auth.user?.role === "admin") {
      notify.incChef();
      playNewOrderSound();
    }

    try {
      await Promise.all([pos.fetchActiveOrders(), pos.fetchTables()]);
    } catch {}
  });

  socket.on("order-status-changed", async () => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    // increment for waiter/admin only
    if (auth.user?.role === "waiter" || auth.user?.role === "admin") {
      notify.incFinished();
      playNewOrderSound();
    }

    try {
      await Promise.all([pos.fetchActiveOrders(), pos.fetchTables()]);
    } catch {}
  });

  socket.on("order-updated", async () => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    // increment for chef/admin only
    if (auth.user?.role === "chef" || auth.user?.role === "admin") {
      notify.incChef();
      playNewOrderSound();
    }

    try {
      await Promise.all([pos.fetchActiveOrders(), pos.fetchTables()]);
    } catch {}
  });

  return { provide: { socket } };
});
