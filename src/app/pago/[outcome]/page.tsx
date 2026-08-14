import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentPoller } from "@/components/payment-poller";
import { SiteShell } from "@/components/site-shell";
import { getTeam } from "@/lib/store";
import { DIVISIONS, formatMXN } from "@/lib/thf";

/** Nunca cachear: el estado del equipo cambia por webhook. */
export const dynamic = "force-dynamic";

const OUTCOMES = ["exito", "pendiente", "error"] as const;
type Outcome = (typeof OUTCOMES)[number];

function isOutcome(value: string): value is Outcome {
  return (OUTCOMES as readonly string[]).includes(value);
}

export default async function PagoPage({
  params,
  searchParams,
}: PageProps<"/pago/[outcome]">) {
  const { outcome } = await params;
  if (!isOutcome(outcome)) notFound();

  const query = await searchParams;
  const teamId = typeof query.team === "string" ? query.team : null;
  const team = teamId ? await getTeam(teamId) : null;

  // El estado que mandamos a pintar sale del store, no del query string: la URL
  // de retorno la puede escribir cualquiera a mano.
  const paid = team?.status === "paid";
  const lastPayment = team?.payments.at(-1) ?? null;
  const rejected = lastPayment?.status === "rejected" || lastPayment?.status === "cancelled";

  const confirming = !paid && !rejected && outcome !== "error";

  return (
    <SiteShell>
      <section className="mx-auto max-w-2xl px-5 py-20">
        {confirming ? <PaymentPoller /> : null}

        {paid ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
              Inscripcion pagada
            </p>
            <h1 className="thf-wordmark mt-4 text-4xl">Tu equipo esta dentro</h1>
            <p className="mt-4 text-white/60">
              Confirmamos el pago de {formatMXN(team.amountMXN)}. Te llega el comprobante al
              correo del atleta 1, y tu credencial queda liberada en el perfil del equipo.
            </p>
          </>
        ) : rejected ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
              Pago rechazado
            </p>
            <h1 className="thf-wordmark mt-4 text-4xl">No se completo el cobro</h1>
            <p className="mt-4 text-white/60">
              Mercado Pago rechazo el pago
              {lastPayment?.statusDetail ? ` (${lastPayment.statusDetail})` : ""}. Tu lugar no
              se aparta hasta que el pago quede aprobado; puedes intentar con otro metodo.
            </p>
          </>
        ) : outcome === "error" ? (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-400">
              Pago no completado
            </p>
            <h1 className="thf-wordmark mt-4 text-4xl">Algo salio mal</h1>
            <p className="mt-4 text-white/60">
              El pago no se proceso. No se te cobro nada; puedes volver a intentarlo.
            </p>
          </>
        ) : (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-thf-orange">
              Confirmando
            </p>
            <h1 className="thf-wordmark mt-4 text-4xl">Estamos validando tu pago</h1>
            <p className="mt-4 text-white/60">
              Mercado Pago todavia no nos confirma la operacion. Si pagaste en efectivo puede
              tardar hasta unas horas. Esta pagina se actualiza sola, y en cuanto quede
              aprobado te avisamos por correo.
            </p>
          </>
        )}

        {team ? (
          <dl className="mt-10 divide-y divide-thf-line rounded-2xl border border-thf-line bg-thf-panel">
            {[
              { label: "Equipo", value: team.name },
              { label: "Division", value: DIVISIONS[team.division].name },
              { label: "Monto", value: `${formatMXN(team.amountMXN)} MXN` },
              { label: "Referencia", value: team.id },
              ...(lastPayment
                ? [{ label: "Metodo", value: lastPayment.paymentMethod ?? "Mercado Pago" }]
                : []),
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
              >
                <dt className="text-white/45">{row.label}</dt>
                <dd className="text-right font-medium break-all">{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-10 text-sm text-white/45">
            No encontramos el registro de este equipo. Si ya pagaste, escribenos con tu
            comprobante y lo validamos a mano.
          </p>
        )}

        <div className="mt-10 flex gap-4 text-sm">
          <Link href="/" className="text-thf-orange hover:text-thf-orange-hi">
            ← Volver al inicio
          </Link>
          {!paid ? (
            <Link href="/perfil" className="text-thf-orange hover:text-thf-orange-hi">
              Intentar de nuevo
            </Link>
          ) : null}
        </div>
      </section>
    </SiteShell>
  );
}
