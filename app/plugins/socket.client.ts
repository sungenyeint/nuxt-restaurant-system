// plugins/socket.client.ts
import { io } from "socket.io-client";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const socket = io(config.public.socketUrl, { transports: ["websocket"] });

  // Preload sound files
  const audioSources: Record<string, string> = {
    chef: "/sounds/chef.wav",
    waiter: "/sounds/waiter.wav",
    cashier: "/sounds/cashier.wav",
    admin: "/sounds/noti.wav",
    generic: "/sounds/noti.wav",
  };

  const audios: Record<string, HTMLAudioElement | null> = {};
  if (typeof Audio !== "undefined") {
    for (const [k, src] of Object.entries(audioSources)) {
      try {
        audios[k] = new Audio(src);
        audios[k]!.volume = 0.5;
      } catch {
        audios[k] = null;
      }
    }
  }

  let lastSoundAt = 0;
  const SOUND_THROTTLE_MS = 2000;

  // User interaction state
  let userInteracted = false;
  const soundQueue: string[] = [];

  // Unlock audio on first click/tap
  const unlockAudio = () => {
    userInteracted = true;
    Object.values(audios).forEach((audio) => {
      if (!audio) return;
      audio.play().then(() => audio.pause()).catch(() => {});
    });

    // Play queued sounds
    while (soundQueue.length > 0) {
      const type = soundQueue.shift();
      if (type) playSound(type);
    }
  };

  if (typeof window !== "undefined") {
    document.addEventListener("click", unlockAudio, { once: true });
    document.addEventListener("keydown", unlockAudio, { once: true });
  }

  const playSound = (type = "generic") => {
    const now = Date.now();
    if (now - lastSoundAt < SOUND_THROTTLE_MS) return;
    lastSoundAt = now;

    if (!userInteracted) {
      soundQueue.push(type);
      return;
    }

    const audio = audios[type] || audios.generic;
    if (!audio) return;

    try {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {}
  };

  socket.on("connect", () => {
    console.log("Socket connected", socket.id);
  });

  // Example: order-created notification
  socket.on("order-created", async ([order, triggerRole]) => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    if (auth.user?.role === "chef") {
      notify.sendChef();
      notify.setChefLastId(order._id || order.id);
      playSound("chef");
    }
    if (triggerRole !== 'admin' && auth.user?.role === "admin" && notify.enabled) {
      notify.sendAdmin();
      notify.setAdminLastId(order._id || order.id);
      playSound("admin");
    }

    try {
      await Promise.all([pos.fetchOrders(), pos.fetchTables()]);
    } catch {}
  });

  socket.on("order-status-changed", async ([updated, triggerRole]) => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    try {
      if (updated?.status === "ready") {
        if (auth.user?.role === "waiter") {
          notify.sendWaiter();
          notify.setWaiterLastId(updated._id || updated.id);
          playSound("waiter");
        }
        if (triggerRole !== 'admin' && auth.user?.role === "admin" && notify.enabled) {
          notify.sendAdmin();
          notify.setAdminLastId(updated._id || updated.id);
          playSound("admin");
        }
      }

      if (updated?.status === "served") {
        if (auth.user?.role === "cashier") {
          notify.sendCashier();
          notify.setCashierLastId(updated._id || updated.id);
          playSound("cashier");
        }
        if (triggerRole !== 'admin' && auth.user?.role === "admin" && notify.enabled) {
          notify.sendAdmin();
          notify.setAdminLastId(updated._id || updated.id);
          playSound("admin");
        }
      }

      if (updated?.status === "paid") {
        if (triggerRole !== 'admin' && auth.user?.role === "admin" && notify.enabled) {
          notify.sendAdmin();
          notify.setAdminLastId(updated._id || updated.id);
          playSound("admin");
        }
      }

      await Promise.all([pos.fetchOrders(), pos.fetchTables()]);
    } catch {}
  });

  socket.on("order-updated", async ([updated, triggerRole]) => {
    const pos = usePosStore();
    const auth = useAuthStore();
    const notify = useNotifyStore();

    if (auth.user?.role === "chef") {
      notify.sendChef();
      notify.setChefLastId(updated._id || updated.id);
      playSound("chef");
    }
    if (triggerRole !== 'admin' && auth.user?.role === "admin" && notify.enabled) {
      notify.sendAdmin();
      notify.setAdminLastId(updated._id || updated.id);
      playSound("admin");
    }

    try {
      await Promise.all([pos.fetchOrders(), pos.fetchTables()]);
    } catch {}
  });

  return { provide: { socket } };
});
