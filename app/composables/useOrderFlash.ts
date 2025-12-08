import { ref, watch, onMounted } from "vue";
import type { Role } from "~/types";

export function useOrderFlash(
  ordersRef: ComputedRef<any[]>,
  notifyStore: any,
  role: Role
) {
  const flashing = ref<Record<string, boolean>>({});

  const isNew = (o: any) => {
    const id = o._id || o.id;
    return notifyStore[role + "LastId"].includes(id);
  };

  const flashOrder = (id: string) => {
    if (flashing.value[id]) return;

    flashing.value[id] = true;

    // Stop flashing after 5s
    setTimeout(() => {
      flashing.value[id] = false;
      notifyStore[
        "remove" + role?.charAt(0).toUpperCase() + role?.slice(1) + "LastId"
      ](id);
      notifyStore["clear" + role?.charAt(0).toUpperCase() + role?.slice(1)]?.();
    }, 5000);
  };

  // MAIN CLEAN WATCHER — only watches newest order ID
  watch(
    () => ordersRef.value.at(-1)?._id,
    (newId, oldId) => {
      console.log("Detected new order ID:", newId, "old ID:", oldId);
      if (!newId || newId === oldId) return;

      if (notifyStore[role + "LastId"].includes(newId)) {
        flashOrder(newId);
      }
    }
  );

  // When switching tabs / re-visiting page → reflash pending orders
  watch(
    ordersRef,
    (list) => {
      list.forEach((o) => {
        const id = o._id || o.id;
        if (isNew(o)) flashOrder(id);
      });
    },
    { deep: true }
  );

  // Clear notifications when chef/admin opens page
  onMounted(() => {
    notifyStore["clear" + role?.charAt(0).toUpperCase() + role?.slice(1)]?.();
  });

  return {
    flashing,
    isFlashing: (o: any) => flashing.value[o._id || o.id],
  };
}
