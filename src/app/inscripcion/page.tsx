import { redirect } from "next/navigation";

/**
 * La inscripcion vive dentro del perfil, siguiendo el flujo del prototipo:
 * Landing → Login → Perfil → equipo → pago.
 *
 * Esta ruta existio como atajo mientras no habia autenticacion. Se queda como
 * redireccion para no romper enlaces que ya se hayan compartido.
 */
export default function InscripcionPage() {
  redirect("/perfil");
}
