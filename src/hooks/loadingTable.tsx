import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useLoteLoadingToast = (loading: boolean, mensje = "Cargando...") => {
  const toastIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (loading && !toastIdRef.current) {
      // Mostrar el toast solo una vez
      toastIdRef.current = toast.loading(mensje);
    }

    if (!loading && toastIdRef.current) {
      // Ocultar el toast cuando termine la carga
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = null;
    }
  }, [loading]);
};
