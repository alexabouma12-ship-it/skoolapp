# Skoolapp

Application web de suivi des élèves pour un éducateur de lycée (Côte d'Ivoire) : fiches élèves, parents, observations, incidents et sanctions, recherche multicritère. Pensée d'abord pour le téléphone, elle s'installe sur l'écran d'accueil.

Voir [PLAN.md](PLAN.md) pour le cahier des charges et la feuille de route.

## Stack

- **Next.js 16** (App Router, Server Actions, `proxy.ts`), TypeScript, Tailwind CSS 4
- **Supabase** : PostgreSQL, authentification, stockage des photos, Row Level Security
- Hébergement **Vercel** (tâche planifiée quotidienne qui empêche la mise en pause de Supabase)

## Mise en route

### 1. Base de données Supabase

1. Créez un projet sur [supabase.com](https://supabase.com) (région **eu-west-3, Paris**).
2. Dans **SQL Editor**, exécutez le fichier [supabase/migrations/20261028000000_schema_initial.sql](supabase/migrations/20261028000000_schema_initial.sql).
3. Dans **Authentication > Sign In / Providers**, désactivez **Allow new users to sign up** : l'application n'a pas de page d'inscription publique.
4. Dans **Authentication > Users > Add user**, créez le compte de l'éducateur (email et mot de passe, cochez **Auto Confirm User**).

### 2. Variables d'environnement

Copiez `.env.example` en `.env.local`, puis remplissez-le avec les valeurs de **Project Settings > API** :

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
CRON_SECRET=...   # chaîne aléatoire, utilisée seulement en production
```

### 3. Lancement en local

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000 et connectez-vous.

### 4. Mise en ligne sur Vercel

1. Poussez le dépôt sur GitHub, puis importez-le dans Vercel.
2. Ajoutez les 3 variables d'environnement ci-dessus.
3. Déployez. La tâche `/api/keepalive` (définie dans `vercel.json`) s'exécutera chaque jour à 6 h.
4. Sur le téléphone, ouvrez le site puis choisissez **Ajouter à l'écran d'accueil**.

## Organisation du code

```
src/
  proxy.ts                    redirige vers /connexion sans session
  app/
    connexion/                page de connexion
    (app)/                    pages protégées (barre de navigation)
      page.tsx                recherche multicritère + tableau de bord
      classes/                liste, création, détail d'une classe
      eleves/                 création (saisie en série), fiche, sous-pages
      parametres/             types d'incident/sanction, export, déconnexion
    api/export/               export CSV (Excel) des élèves, observations, incidents
    api/keepalive/            ping quotidien de la base
  lib/
    actions/                  Server Actions (écritures)
    donnees.ts                lectures
    supabase/                 clients serveur, navigateur et proxy
  components/                 UI partagée
supabase/migrations/          schéma SQL, RLS, recherche, bucket photos
```

## Recherche

La barre de recherche accepte :

- un nom ou des prénoms, sans tenir compte des accents ni de l'ordre, et avec tolérance aux fautes de frappe ;
- un matricule ;
- une date de naissance au format `12/03/2010` ;
- une partie du numéro de téléphone d'un parent (au moins 4 chiffres).

On peut la combiner avec des filtres : classe, sexe, élèves ayant des incidents.
