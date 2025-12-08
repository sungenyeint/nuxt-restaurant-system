import { ref, provide } from "vue";

type ToastType = "success" | "error" | "info";

export function useToast() {
  const toast = ref<{
    message: string;
    type: ToastType;
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });

  provide("toast", toast);

  const showToast = (
    message: string,
    type: ToastType = "success",
    duration = 3000
  ) => {
    toast.value = { message, type, visible: true };
    setTimeout(() => {
      toast.value.visible = false;
    }, duration);
  };

  return { toast, showToast };
}
