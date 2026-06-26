# Factura TN — Contexte projet

## Description

SaaS de facturation pour PME tunisiennes. Interface bilingue arabe/français avec support RTL natif.
Marché cible : PME tunisiennes de 1 à 50 employés.

---

## Stack technique & règles absolues

| Technologie | Version | Règle |
|---|---|---|
| React | 18 | Composants fonctionnels uniquement |
| TypeScript | strict | **Zéro `any` toléré** |
| Tailwind CSS | v3 | Jamais `ml-`, `mr-`, `pl-`, `pr-` — toujours les variantes `rtl:` ou classes logiques |
| i18next | latest | **Zéro texte hardcodé** côté UI — tout passe par `t()` |
| React Router | v6 | — |
| Vite | latest | Bundler |

### Règles RTL strictes
- Utiliser `rtl:` prefix Tailwind ou propriétés CSS logiques (`margin-inline-start/end`, `padding-inline-start/end`)
- La sidebar se positionne à droite (`right-0`) en arabe, à gauche (`left-0`) en français
- `html[dir]` et `html[lang]` sont gérés dynamiquement par `LanguageContext` — ne jamais les setter manuellement ailleurs
- Polices : **Noto Sans Arabic** pour `lang="ar"`, **Inter** pour `lang="fr"`

### Règles i18n
- Toute nouvelle clé de traduction doit être ajoutée **simultanément** dans `src/i18n/fr.json` ET `src/i18n/ar.json`
- Structure des clés : `namespace.sousSection.clé` (ex: `nav.invoices`, `errors.required`)
- Les deux fichiers doivent rester parfaitement synchronisés en structure

---

## Contexte métier tunisien

### Devise
- Dinar tunisien (DT)
- Format d'affichage : `1 234,000 DT` (3 décimales, séparateur de milliers = espace, décimale = virgule)
- Code ISO : TND

### TVA (Taxe sur la Valeur Ajoutée)
Trois taux applicables selon la nature des produits/services :
- **19%** — taux standard (majorité des biens et services)
- **13%** — taux intermédiaire (certains services bancaires, assurances)
- **7%** — taux réduit (produits alimentaires de base, médicaments, etc.)

### Formats de date
| Langue | Format | Exemple |
|---|---|---|
| Français | `DD/MM/YYYY` | 25/06/2026 |
| Arabe | `YYYY/MM/DD` | 2026/06/25 |

### Conformité fiscale
Les factures émises doivent respecter les exigences de la **Direction Générale des Impôts (DGI)** tunisienne :
- Numéro de facture séquentiel et unique
- Matricule fiscal du vendeur obligatoire (format : `XXXXXXX/X/X/XXX`)
- Numéro de la carte d'identité fiscale (CIF)
- Détail des montants HT, TVA par taux, et TTC
- Timbre fiscal le cas échéant

---

## Conventions de code

- **Composants** : PascalCase (`InvoiceCard`, `ClientForm`)
- **Hooks** : préfixés `use` (`useInvoice`, `useLanguage`)
- **Types & interfaces** : définis dans `/src/types/` — importer depuis là, jamais inline dans les composants
- **Fichiers** : un composant = un fichier, nom identique au composant exporté
- **Commits** : en anglais, format conventionnel (`feat:`, `fix:`, `refactor:`, `chore:`)
- **Pas de `console.log`** en production — utiliser un logger ou supprimer avant commit

### Structure des dossiers
```
/src
  /i18n          — fichiers de traduction fr.json, ar.json, index.ts
  /components
    /ui           — composants atomiques réutilisables (Button, Input, Badge...)
    /layout       — AppLayout, Sidebar, Topbar
  /contexts       — React contexts (LanguageContext, AuthContext...)
  /hooks          — hooks custom
  /pages          — une page = un fichier (DashboardPage, InvoicesPage...)
  /types          — interfaces et types TypeScript
  /utils          — fonctions utilitaires pures (formatCurrency, formatDate...)
```

---

## Hors scope MVP

Les fonctionnalités suivantes ne font **pas** partie du MVP et ne doivent pas être implémentées :

- Gestion RH et paie
- Gestion des stocks / inventaire
- Application mobile (React Native ou autre)
- Intégration bancaire directe
- Comptabilité générale avancée
- Module de paie / fiches de salaire
