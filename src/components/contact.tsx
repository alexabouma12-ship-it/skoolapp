import { MessageCircle, Phone } from "lucide-react";
import { formatTelephone, lienAppel, lienWhatsApp } from "@/lib/format";
import { classesBouton } from "./ui";

/** Numéro cliquable avec boutons Appeler et WhatsApp. */
export function Telephone({ numero, whatsapp = true }: { numero: string; whatsapp?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-base text-ink">{formatTelephone(numero)}</span>
      <a href={lienAppel(numero)} className={classesBouton("secondaire", "min-h-9 px-3")}>
        <Phone className="size-4" aria-hidden /> Appeler
      </a>
      {whatsapp && (
        <a
          href={lienWhatsApp(numero)}
          target="_blank"
          rel="noopener noreferrer"
          className={classesBouton("secondaire", "min-h-9 px-3 text-action")}
        >
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
      )}
    </div>
  );
}
