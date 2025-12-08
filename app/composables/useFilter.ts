import type { Role, TabKey } from "~/types";

export const useFilter = (
  orders: ComputedRef<any[]>,
  active: Ref<TabKey>,
  role: Role | undefined,
  notify: any
) => {
  const filtered = computed(() => {
    const base =
      active.value === "all"
        ? orders.value
        : active.value === "active"
        ? orders.value.filter((o) => o.status !== "paid")
        : orders.value.filter(
            (o) =>
              o.status === active.value ||
              (active.value === "ready" && o.status === "ready")
          );

    return [...base].sort((a, b) => {
      const idA = a._id || a.id;
      const idB = b._id || b.id;
      const newList = notify[`${role}LastId`] ?? [];

      const isNewA = newList.includes(idA);
      const isNewB = newList.includes(idB);

      return +isNewB - +isNewA;
    });
  });

  return { filtered };
};
