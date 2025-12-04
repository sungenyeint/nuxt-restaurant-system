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
