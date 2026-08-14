"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Refresca la pagina mientras el pago siga sin confirmarse.
 *
 * El usuario suele volver de Mercado Pago antes de que llegue el webhook, asi
 * que la primera pintada casi siempre dice "confirmando". Esto revisa cada
 * pocos segundos hasta que el servidor ya tenga el pago aplicado.
 */
export function PaymentPoller({ intervalMs = 4000, maxAttempts = 15 }) {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (attempts > maxAttempts) {
        clearInterval(timer);
        return;
      }
      router.refresh();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [router, intervalMs, maxAttempts]);

  return null;
}
