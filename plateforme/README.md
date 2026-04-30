# Plateforme Expérimentale — Mémoire Ergonomie Cognitive

## Structure du projet

```
plateforme/
├── index.html                  # Accueil + enregistrement participant + admin
├── questionnaire-pre.html      # Pré-questionnaire (filtrage + aisance numérique)
├── experience.html             # Passation des tâches (chrono + clics + validation)
├── questionnaire-interface.html # SUS + NASA-TLX par interface (entre chaque interface)
├── questionnaire-post.html     # Questionnaires post-expérience complets (fin)
├── fin.html                    # Récapitulatif + export CSV
├── styles/
│   └── main.css               # CSS global
├── scripts/
│   └── main.js                # Logique principale (état, chrono, clics, data, export)
└── interfaces/
    ├── interface1v2/           # Interface Type 1 (non ergonomique)
    ├── interface2/             # Interface Type 2 (standard WCAG AA)
    └── interface3/             # Interface Type 3 (senior-friendly)
```

## Flux de l'expérience

```
index.html
  ↓ (saisie code + groupe + mode questionnaire)
  ↓ si "numérique" → questionnaire-pre.html
  ↓ si "papier"    → experience.html directement
experience.html
  ↓ (6 tâches sur 3 interfaces)
  ↓ si "numérique" → questionnaire-interface.html (après chaque interface)
  ↓
  ↓ si "numérique" → questionnaire-post.html
  ↓ si "papier"    → fin.html directement
fin.html
  ↓ Export CSV
```

## Tâches de l'expérience

| # | Interface | Type | Tâche |
|---|-----------|------|-------|
| 1 | Non-ergo | Simple | Trouver le numéro d'assurance maladie |
| 2 | Non-ergo | Complexe | Retrouver le dernier remboursement |
| 3 | Standard | Simple | Modifier l'adresse email |
| 4 | Standard | Complexe | Changer de médecin traitant |
| 5 | Senior | Simple | Commander la CEAM |
| 6 | Senior | Complexe | Délais de traitement (8 avril 2026) |

## Format des données exportées

### Fichier tâches (CSV Jamovi)
| Colonne | Description |
|---------|-------------|
| code_participant | Code saisi à l'accueil |
| groupe | jeune / senior |
| questionnaire_mode | papier / numerique |
| interface | type1 / type2 / type3 |
| tache | Libellé de la tâche |
| type_tache | simple / complexe |
| temps_secondes | Durée en secondes |
| nombre_clics | Nombre de clics enregistrés |
| reussite | 1 (réussie) / 0 (échouée) |
| note | Observations de l'expérimentateur |
| timestamp | Horodatage ISO 8601 |

### Fichier questionnaires (CSV Jamovi)
| Colonne | Description |
|---------|-------------|
| instrument | SUS / NASA-TLX-interface |
| interface | type1 / type2 / type3 |
| q1…q10 | Réponses SUS (1-5) |
| q1…q6 | Réponses NASA-TLX (1-7) |
| global | Appréciation globale SUS |

## Déploiement sur Vercel

1. Placer le dossier `plateforme/` à la racine du dépôt GitHub
2. Dans Vercel : importer le dépôt → Framework = "Other" → Output Directory = `plateforme`
3. Les interfaces doivent être placées dans `interfaces/` avec les mêmes noms de dossiers

## Notes techniques

- **Pas de backend** : toutes les données sont stockées en `localStorage`
- **Export CSV** : encodage UTF-8 avec BOM (compatible Excel/Jamovi)
- **Chronomètre** : précision à 0.1 seconde, affiché en MM:SS.d
- **Compteur de clics** : écoute les événements `click` et `touchstart` dans l'iframe. En cas de restriction cross-origin, utiliser le bouton "+ 1 clic manuel"
- **Compatible Vercel** : aucune dépendance serveur, tout HTML/CSS/JS statique

## Ordre de passation recommandé

1. Expérimentateur saisit le code participant et sélectionne le groupe
2. Participant remplit le pré-questionnaire (ou version papier)
3. L'expérimentateur lit chaque énoncé à voix haute
4. L'expérimentateur démarre le chronomètre au signal
5. L'expérimentateur arrête le chrono quand la tâche est terminée
6. L'expérimentateur valide "Réussie" ou "Échouée"
7. Entre chaque interface : questionnaire SUS + NASA-TLX (si numérique)
8. Fin : export CSV automatique

## Référence des questionnaires

- **MMSE** (Folstein et al., 1975) : passé en version papier obligatoirement
- **F-SUS** (Gronier & Baudet, 2021) : 10 items, échelle 1-5
- **NASA-TLX** : 6 items, échelle 1-7 (simplifié, sans pondération)
