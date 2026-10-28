import { Pencil, UserPlus } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { lireClasse, urlsPhotos } from "@/lib/donnees";
import { ListeEleves } from "@/components/eleves";
import { EnTete, EtatVide, LienBouton } from "@/components/ui";

export default async function PageClasse({ params }: PageProps<"/classes/[id]">) {
  const { id } = await params;
  const classe = await lireClasse(id);
  const { supabase } = await requireUser();

  const { data } = await supabase
    .from("eleves")
    .select("id, nom, prenoms, sexe, matricule, date_naissance, photo_path, incidents(count)")
    .eq("classe_id", id)
    .eq("archive", false)
    .order("nom")
    .order("prenoms");

  const eleves = (data ?? []).map((e) => ({
    ...e,
    nb_incidents: (e.incidents as unknown as { count: number }[])[0]?.count ?? 0,
  }));
  const photos = await urlsPhotos(supabase, eleves.map((e) => e.photo_path));
  const filles = eleves.filter((e) => e.sexe === "F").length;
  const garcons = eleves.filter((e) => e.sexe === "M").length;

  return (
    <>
      <EnTete
        titre={classe.nom}
        sousTitre={`${classe.annee_scolaire} · ${eleves.length} élève${eleves.length > 1 ? "s" : ""} (${filles} F, ${garcons} G)`}
        retour={{ href: "/classes", label: "Classes" }}
        actions={
          <>
            <LienBouton href={`/classes/${id}/modifier`} variante="secondaire">
              <Pencil className="size-4" aria-hidden /> Modifier
            </LienBouton>
            <LienBouton href={`/eleves/nouveau?classe=${id}`}>
              <UserPlus className="size-4" aria-hidden /> Ajouter des élèves
            </LienBouton>
          </>
        }
      />
      {eleves.length ? (
        <ListeEleves eleves={eleves} photos={photos} afficherClasse={false} />
      ) : (
        <EtatVide
          titre="Aucun élève dans cette classe"
          texte="Ajoutez les élèves un par un à partir de votre liste papier."
          action={<LienBouton href={`/eleves/nouveau?classe=${id}`}>Ajouter des élèves</LienBouton>}
        />
      )}
    </>
  );
}
