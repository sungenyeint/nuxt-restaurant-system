import { useState } from "#app";

export const useAuth = () => {
  const user = useState("user", () => null);
  return { user };
};
