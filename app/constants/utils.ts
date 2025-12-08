import type { TabKey } from "~/types";

export const orderStatusClass = (s: string) => {
  switch (s) {
    case "pending":
      return "bg-red-100 text-red-800 border border-red-300";
    case "preparing":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "ready":
      return "bg-green-100 text-green-800 border border-green-300";
    case "served":
      return "bg-gray-200 text-gray-800 border border-gray-300";
    case "paid":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    default:
      return "bg-gray-200 text-gray-800 border border-gray-300";
  }
};

export const tableStatusClass = (s: string) => {
  switch (s) {
    case "available":
        return "bg-green-100 text-green-800 border border-green-300";
    case "occupied":
        return "bg-red-100 text-red-800 border border-red-300";
    case "reserved":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "cleaning":
        return "bg-blue-100 text-blue-800 border border-blue-300";
    default:
        return "bg-gray-200 text-gray-800 border border-gray-300";
  }
};

export const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'pending', label: 'Pending' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'ready', label: 'Ready to Serve' },
    { key: 'served', label: 'Served' },
    { key: 'paid', label: 'Paid' },
];

export const shortId = (o: any) => (o._id || o.id)?.slice?.(0, 6) || o._id || o.id;

