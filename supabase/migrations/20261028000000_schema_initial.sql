-- Skoolapp : schéma initial
-- Chaque ligne appartient à un utilisateur (owner_id) et la Row Level Security
-- garantit qu'un éducateur ne voit que ses propres données.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent() n'est pas IMMUTABLE : ce wrapper permet de l'utiliser dans une colonne générée.
create or replace function public.f_unaccent(text)
returns text
language sql
immutable
parallel safe
strict
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nom text not null check (length(trim(nom)) > 0),
  annee_scolaire text not null,
  created_at timestamptz not null default now(),
  unique (owner_id, annee_scolaire, nom)
);

create table public.eleves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  classe_id uuid references public.classes (id) on delete set null,
  matricule text,
  nom text not null check (length(trim(nom)) > 0),
  prenoms text not null default '',
  sexe text check (sexe in ('M', 'F')),
  date_naissance date,
  lieu_naissance text,
  statut text check (statut in ('affecte', 'non_affecte')),
  redoublant boolean not null default false,
  regime text check (regime in ('externe', 'demi_pension', 'interne')),
  adresse text,
  telephone text,
  notes text,
  photo_path text,
  archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  search_text text generated always as (
    public.f_unaccent(lower(coalesce(nom, '') || ' ' || coalesce(prenoms, '') || ' ' || coalesce(matricule, '')))
  ) stored
);

create unique index eleves_matricule_unique on public.eleves (owner_id, upper(matricule)) where matricule is not null;
create index eleves_classe_idx on public.eleves (classe_id);
create index eleves_search_trgm_idx on public.eleves using gin (search_text extensions.gin_trgm_ops);

create trigger eleves_updated_at before update on public.eleves
  for each row execute function public.set_updated_at();

create table public.responsables (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nom text not null check (length(trim(nom)) > 0),
  prenoms text not null default '',
  lien text not null default 'autre' check (lien in ('pere', 'mere', 'tuteur', 'tutrice', 'autre')),
  telephone_1 text,
  telephone_2 text,
  whatsapp text,
  email text,
  commune text,
  quartier text,
  profession text,
  created_at timestamptz not null default now()
);

create table public.eleve_responsables (
  eleve_id uuid not null references public.eleves (id) on delete cascade,
  responsable_id uuid not null references public.responsables (id) on delete cascade,
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  principal boolean not null default false,
  primary key (eleve_id, responsable_id)
);

create index eleve_responsables_responsable_idx on public.eleve_responsables (responsable_id);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eleve_id uuid not null references public.eleves (id) on delete cascade,
  date_observation date not null default current_date,
  categorie text not null default 'comportement'
    check (categorie in ('comportement', 'travail', 'sante', 'entretien', 'famille', 'positif', 'autre')),
  contenu text not null check (length(trim(contenu)) > 0),
  created_at timestamptz not null default now()
);

create index observations_eleve_idx on public.observations (eleve_id, date_observation desc);

create table public.types_incident (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  libelle text not null check (length(trim(libelle)) > 0),
  unique (owner_id, libelle)
);

create table public.types_sanction (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  libelle text not null check (length(trim(libelle)) > 0),
  gravite smallint not null default 1,
  unique (owner_id, libelle)
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  eleve_id uuid not null references public.eleves (id) on delete cascade,
  date_incident date not null default current_date,
  type_incident_id uuid references public.types_incident (id) on delete set null,
  description text,
  lieu text,
  type_sanction_id uuid references public.types_sanction (id) on delete set null,
  date_sanction date,
  duree_sanction text,
  parent_informe boolean not null default false,
  commentaire text,
  created_at timestamptz not null default now()
);

create index incidents_eleve_idx on public.incidents (eleve_id, date_incident desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'classes', 'eleves', 'responsables', 'eleve_responsables',
    'observations', 'types_incident', 'types_sanction', 'incidents'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "proprietaire" on public.%I for all to authenticated
         using ((select auth.uid()) = owner_id)
         with check ((select auth.uid()) = owner_id)',
      t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Valeurs par défaut des listes (types d'incident et de sanction)
-- ---------------------------------------------------------------------------

create or replace function public.creer_listes_par_defaut(p_owner uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.types_incident (owner_id, libelle)
  select p_owner, l from unnest(array[
    'Retard', 'Absence injustifiée', 'Bavardage', 'Insolence', 'Indiscipline',
    'Bagarre', 'Tricherie', 'Tenue non conforme', 'Dégradation de matériel',
    'Usage du téléphone', 'Sortie sans autorisation', 'Autre'
  ]) as l
  on conflict do nothing;

  insert into public.types_sanction (owner_id, libelle, gravite)
  select p_owner, l, g from (values
    ('Avertissement oral', 1),
    ('Avertissement écrit', 2),
    ('Convocation des parents', 2),
    ('Consigne / retenue', 3),
    ('Blâme', 4),
    ('Exclusion temporaire', 5),
    ('Conseil de discipline', 6)
  ) as v (l, g)
  on conflict do nothing;
$$;

revoke execute on function public.creer_listes_par_defaut(uuid) from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.creer_listes_par_defaut(new.id);
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Comptes déjà existants au moment de la migration.
select public.creer_listes_par_defaut(id) from auth.users;

-- ---------------------------------------------------------------------------
-- Recherche multicritère
-- ---------------------------------------------------------------------------

create or replace function public.rechercher_eleves(
  q text default null,
  p_classe uuid default null,
  p_sexe text default null,
  p_date_naissance date default null,
  p_avec_incidents boolean default false,
  p_limite integer default 60
)
returns table (
  id uuid,
  matricule text,
  nom text,
  prenoms text,
  sexe text,
  date_naissance date,
  photo_path text,
  classe_id uuid,
  classe_nom text,
  nb_incidents bigint,
  score real
)
language sql
stable
security invoker
set search_path = ''
as $$
  with p as (
    select
      public.f_unaccent(lower(trim(coalesce(q, '')))) as nq,
      regexp_replace(coalesce(q, ''), '\D', '', 'g') as chiffres
  ),
  mots as (
    select array_remove(string_to_array(p.nq, ' '), '') as liste from p
  )
  select
    e.id, e.matricule, e.nom, e.prenoms, e.sexe, e.date_naissance, e.photo_path,
    e.classe_id, c.nom,
    (select count(*) from public.incidents i where i.eleve_id = e.id),
    case when p.nq = '' then 0 else extensions.word_similarity(p.nq, e.search_text) end
  from public.eleves e
  cross join p
  cross join mots
  left join public.classes c on c.id = e.classe_id
  where not e.archive
    and (
      p.nq = ''
      -- tous les mots tapés sont présents (ordre libre)
      or not exists (select 1 from unnest(mots.liste) w where e.search_text not like '%' || w || '%')
      -- tolérance aux fautes de frappe
      or extensions.word_similarity(p.nq, e.search_text) >= 0.45
      -- recherche par numéro de téléphone d'un parent
      or (length(p.chiffres) >= 4 and exists (
        select 1
        from public.eleve_responsables er
        join public.responsables r on r.id = er.responsable_id
        where er.eleve_id = e.id
          and (
            regexp_replace(coalesce(r.telephone_1, ''), '\D', '', 'g') like '%' || p.chiffres || '%'
            or regexp_replace(coalesce(r.telephone_2, ''), '\D', '', 'g') like '%' || p.chiffres || '%'
            or regexp_replace(coalesce(r.whatsapp, ''), '\D', '', 'g') like '%' || p.chiffres || '%'
          )
      ))
    )
    and (p_classe is null or e.classe_id = p_classe)
    and (p_sexe is null or e.sexe = p_sexe)
    and (p_date_naissance is null or e.date_naissance = p_date_naissance)
    and (not p_avec_incidents or exists (select 1 from public.incidents i where i.eleve_id = e.id))
  order by 11 desc, e.nom, e.prenoms
  limit p_limite;
$$;

-- ---------------------------------------------------------------------------
-- Stockage des photos (bucket privé, un dossier par utilisateur)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "photos_proprietaire_select" on storage.objects for select to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos_proprietaire_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos_proprietaire_update" on storage.objects for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "photos_proprietaire_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
