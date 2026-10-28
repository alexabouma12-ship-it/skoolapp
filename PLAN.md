# Skoolapp : plan de développement

> Outil personnel pour un éducateur de lycée (Côte d'Ivoire, de la 6e à la Terminale) qui suit 2 ou 3 classes.
> Objectif n°1 : **gagner du temps** en retrouvant instantanément n'importe quelle information sur un élève, depuis le téléphone ou l'ordinateur.

---

## 1. Contexte

| Élément | Décision |
|---|---|
| Utilisateur | 1 éducateur, débutant en informatique |
| Périmètre | 2 ou 3 classes, soit environ 100 à 200 élèves par an |
| Outil actuel | Classeurs et chemises papier |
| Appareils | Téléphone (prioritaire) et ordinateur |
| Arrivée des listes | Listes papier, donc **saisie manuelle** : elle doit être très rapide |
| Échéance | MVP utilisable en **environ 4 semaines** |
| Développeur | Toi, seul |

---

## 2. Périmètre

### Dans la v1 (MVP)
1. **Fiches élèves** : identité, matricule, date de naissance, sexe, classe, photo (optionnelle).
2. **Responsables légaux** : nom, lien (père, mère, tuteur), téléphones, quartier ou commune, profession. Bouton **Appeler** et bouton **WhatsApp** en un clic.
3. **Observations** : notes datées sur le comportement, les progrès ou un entretien.
4. **Incidents et sanctions** : historique complet par élève.
5. **Recherche multicritère** : nom ou prénom (sans tenir compte des accents ni des fautes de frappe), matricule, date de naissance, classe, sexe, élèves ayant eu des incidents.
6. **Connexion sécurisée** : un seul compte.

### Hors v1 (prévu pour plus tard)
Absences et retards, note de conduite trimestrielle, import Excel, export PDF, statistiques, accès parents, multi-éducateurs et multi-établissements, mode hors ligne complet.

---

## 3. Stack technique

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15** (App Router) + **TypeScript** | Front et back dans un seul projet, Server Actions pour les formulaires |
| UI | **Tailwind CSS** + **shadcn/ui** | Composants accessibles, rendu mobile soigné sans effort |
| Formulaires | **react-hook-form** + **zod** | Validation partagée entre client et serveur |
| Base de données | **Supabase** (PostgreSQL) | Base, authentification et stockage des photos, offre gratuite |
| Recherche | Extensions Postgres `pg_trgm` + `unaccent` | Recherche floue et insensible aux accents, sans service externe |
| Hébergement | **Vercel** (offre Hobby, gratuite) | Déploiement automatique à chaque `git push` |
| Installation | **PWA** (manifest + icône) | « Ajouter à l'écran d'accueil » sur le téléphone, comme une vraie app |

**Coût prévu : 0 €/mois** au départ, plus un nom de domaine si tu en veux un (environ 10 €/an, optionnel).

> ⚠️ **Piège de l'offre gratuite Supabase** : le projet se met en pause après 7 jours sans activité, par exemple pendant les vacances scolaires. Prévoir une tâche planifiée (cron Vercel ou GitHub Actions) qui interroge la base une fois par jour. Choisir la région **eu-west** (Paris ou Francfort), la plus proche d'Abidjan.

---

## 4. Modèle de données

```
annees_scolaires  (id, libelle "2026-2027", active)
classes           (id, annee_id, niveau, serie, numero, libelle "Tle D2")
eleves            (id, matricule UNIQUE, nom, prenoms, date_naissance, lieu_naissance,
                   sexe, photo_url, statut [affecte|non_affecte], redoublant,
                   regime [externe|demi-pension|interne], notes_generales,
                   created_at, updated_at)
inscriptions      (id, eleve_id, classe_id, annee_id)   -- un élève peut changer de classe d'une année à l'autre
responsables      (id, nom, prenoms, lien [pere|mere|tuteur|autre], telephone_1,
                   telephone_2, whatsapp, commune, quartier, profession)
eleve_responsable (eleve_id, responsable_id, principal BOOLEAN)  -- une fratrie partage les mêmes parents
observations      (id, eleve_id, date, categorie [comportement|travail|sante|entretien|autre],
                   contenu, created_at)
incidents         (id, eleve_id, date, type_incident_id, description, lieu, temoins)
sanctions         (id, incident_id, type_sanction_id, date, duree, parent_informe BOOLEAN, commentaire)
types_incident    (id, libelle)   -- modifiables : bavardage, insolence, bagarre, tricherie, tenue…
types_sanction    (id, libelle)   -- avertissement, blâme, consigne, exclusion temporaire, conseil de discipline…
```

Chaque table porte une colonne `owner_id` (l'utilisateur Supabase), et **Row Level Security** est activée partout avec la règle `owner_id = auth.uid()`. On peut ainsi passer plus tard à plusieurs éducateurs sans tout réécrire.

**Recherche** : une colonne générée `search_text = unaccent(lower(nom || ' ' || prenoms || ' ' || matricule))` avec un index GIN `pg_trgm`. Ainsi « kouame » trouve « KOUAMÉ » et « Kouamé ».

> À vérifier auprès de ton proche : le format exact du matricule (par exemple 8 chiffres suivis d'une lettre), pour valider la saisie.

---

## 5. Écrans

| Écran | Contenu |
|---|---|
| **Connexion** | Email et mot de passe |
| **Accueil / Recherche** | Barre de recherche en haut (cœur de l'app), filtres (classe, sexe, avec incidents), résultats instantanés, accès rapide à « Mes classes » |
| **Liste d'une classe** | Élèves triés par nom, avec photo, matricule et nombre d'incidents |
| **Fiche élève** | En-tête (photo, nom, classe, matricule, âge), boutons 📞 Appeler et 💬 WhatsApp du parent principal, puis onglets **Infos · Parents · Observations · Incidents** |
| **Ajout ou modification d'un élève** | Formulaire court. Le mode **« Enregistrer et ajouter le suivant »** garde la classe présélectionnée pour taper une liste papier à la chaîne |
| **Ajout d'une observation ou d'un incident** | Accessible depuis la fiche élève en 2 taps : date du jour par défaut, type choisi dans une liste |
| **Paramètres** | Année scolaire, classes, types d'incidents et de sanctions |

Principes : **mobile d'abord**, gros boutons, pages légères (la connexion mobile peut être lente), aucun jargon technique.

---

## 6. Plan de développement (4 semaines)

### Semaine 1 : fondations
- [ ] Créer le dépôt Git et le projet Next.js + TypeScript + Tailwind + shadcn/ui
- [ ] Créer le projet Supabase (eu-west) et le relier au projet (`@supabase/ssr`)
- [ ] Écrire les migrations SQL : tables, contraintes, index, extensions `pg_trgm` et `unaccent`
- [ ] Activer les politiques RLS sur toutes les tables
- [ ] Mettre en place l'authentification (page de connexion, middleware de protection des routes, déconnexion)
- [ ] Écrire le seed : types d'incidents et de sanctions par défaut, une année scolaire, des classes et des élèves fictifs
- [ ] Déployer sur Vercel, configurer les variables d'environnement et vérifier que le déploiement fonctionne

### Semaine 2 : élèves et parents
- [ ] Gestion des classes (créer, renommer)
- [ ] Écrans de création, modification et archivage d'un élève
- [ ] Mode de saisie en série « Enregistrer et suivant »
- [ ] Responsables : ajout, liaison à plusieurs élèves (fratrie), responsable principal
- [ ] Liens `tel:` et `https://wa.me/225…` (numéros ivoiriens à 10 chiffres)
- [ ] Envoi de la photo (Supabase Storage, bucket privé, compression côté client)
- [ ] Liste des élèves d'une classe

### Semaine 3 : suivi et recherche
- [ ] Observations : ajout, modification, suppression, chronologie sur la fiche
- [ ] Incidents et sanctions : formulaire, historique, case « parent informé »
- [ ] Recherche multicritère : fonction SQL (RPC) qui combine texte flou, matricule, date de naissance, classe, sexe et présence d'incidents
- [ ] Barre de recherche avec debounce et résultats instantanés
- [ ] Fiche élève complète avec onglets

### Semaine 4 : finitions et mise en main
- [ ] PWA : manifest, icônes, installation sur l'écran d'accueil
- [ ] États vides, chargements, messages d'erreur clairs en français
- [ ] Tests sur un vrai téléphone Android d'entrée de gamme, en 3G
- [ ] Sauvegarde : export CSV manuel de toutes les données, plus la cron de maintien d'activité Supabase
- [ ] Séance de prise en main avec ton proche, puis recueil de ses retours
- [ ] Corrections, puis **mise en production v1** 🎉

---

## 7. Sécurité et données personnelles

Les données concernent des **mineurs** (comportement, sanctions, contacts des familles). Elles sont donc sensibles.

- La **direction de l'établissement** doit être informée et d'accord. En Côte d'Ivoire, la protection des données relève de la loi n° 2013-450 et de l'**ARTCI** : à garder en tête si l'outil se diffuse plus tard.
- RLS activée partout ; la clé `service_role` n'est jamais utilisée côté client.
- Photos dans un bucket **privé**, servies par URL signée.
- Mot de passe robuste. Ajouter la double authentification (2FA) en v2.
- Ne stocker **que le nécessaire** (pas de données médicales en v1).
- Sauvegardes régulières : export CSV, et éventuellement la sauvegarde payante de Supabase plus tard.

---

## 8. Feuille de route après la v1

| Version | Contenu |
|---|---|
| **v1.1** | Retours de ton proche, ajustements d'ergonomie |
| **v2** | Absences et retards (justifiés ou non), **note de conduite trimestrielle** calculée automatiquement, passage d'une année scolaire à la suivante |
| **v2.1** | Fiche élève en PDF (pour un conseil de classe ou de discipline), statistiques par classe |
| **v3** | Messages groupés aux parents (SMS ou WhatsApp), modèles de convocation |
| **v4** | Plusieurs éducateurs et établissements, rôles (éducateur, censeur, proviseur), version SaaS |
| **Plus tard** | Mode hors ligne complet, rédaction assistée par IA des comptes rendus |

---

## 9. Risques et réponses

| Risque | Réponse |
|---|---|
| La saisie initiale de 150 élèves décourage l'utilisateur | Mode « Enregistrer et suivant », seuls le nom, la classe et le matricule sont obligatoires, tu peux faire la saisie avec lui |
| Connexion internet instable | Pages légères, PWA ; mode hors ligne en v2+ si le besoin se confirme |
| Projet Supabase en pause | Cron quotidienne |
| Téléphone perdu ou volé | Session expirable, déconnexion à distance possible depuis Supabase |
| Utilisateur débutant | UI minimaliste, tout en français, prise en main accompagnée |

---

## 10. Questions encore ouvertes

1. Quel est le format exact du **matricule** ?
2. Les classes sont-elles nommées comme « Tle D2 », « 2nde A1 », « 6e 3 » ?
3. Quelles sont les **listes officielles** des incidents et des sanctions dans son lycée ?
4. Veut-il une **photo** des élèves ?
