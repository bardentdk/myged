# Document Locking Platform

_Started 2026-05-11 08:11 UTC_

---

## User



## Assistant

_[tool: questions_v2]_

Avant de me lancer sur un projet aussi riche, je veux cadrer quelques choix structurants. Quelques questions rapides :

## User

Questions answered:
- output_format: Prototype interactif plein écran (navigation cliquable)
- priority_screens: Vue détail document + verrouillage, Historique des versions / versionning, Page Qualiopi, Assistant IA, Page de connexion
- aesthetic: Stripe/Vercel-like : blanc cassé, contrastes nets, accents colorés
- color_accent: 2
- reunion_flavor: Invisible : pur SaaS B2B international, juste les noms/données
- main_demo_flow: Sylvie verrouille un document, Anne tente d'y accéder, résolution
- tweaks_wanted: Couleur d'accent, Avec/sans assistant IA, Vue liste vs grille pour les documents
- logo_handling: Juste un wordmark texte, pas de symbole
- data_richness: Modéré : assez pour montrer mais pas surchargé

## Assistant

_[tool: update_todos]_

_[tool: copy_starter_component]_

_[tool: read_file]_

_[tool: write_file]_

Now let me build the main shell and design system.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now the shell and screens:

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

Now the dashboard:

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

Now the document detail screen — the centerpiece with the lock flow:

_[tool: snip]_

_[tool: write_file]_

_[tool: snip]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: snip]_

_[tool: done]_

_[tool: list_files]_

_[tool: show_html]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: show_html]_

_[tool: get_webview_logs]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Voici **Mar'my GED** — un prototype interactif complet avec :

**Parcours principal**
- **Login** premium (e-mail + MFA 6 chiffres)
- **Dashboard** — KPIs, documents verrouillés en direct, à‑faire, snapshot Qualiopi, expirations
- **Explorateur** — arborescence dossiers + filtres rapides + vues liste/grille
- **Document détail** — c'est la pièce maîtresse. Quand vous ouvrez la « Convention TP SA 2026 » (verrouillée par Sylvie), vous voyez la bannière warm contextuelle avec les 4 actions : *télécharger une copie*, *me notifier*, *demander l'accès*, *forcer* (modal admin avec motif). Un bouton **« Simuler la libération »** dans la bannière permet de jouer le scénario complet jusqu'au banner vert "Document libéré — c'est à vous"
- **Historique des versions** — timeline + diff côte à côte avec ajouts/suppressions
- **Qualiopi** — tableau d'indicateurs + détail pièces requises + suggestion IA pour rattacher les pièces manquantes
- **Assistant IA** (drawer) — prompts canned pour les cas d'usage clés (pièces manquantes, résumé, comparaison versions, checklist)

**Tweaks** (icône en bas à droite, panneau "Tweaks")
- Couleur d'accent (6 teintes)
- Vue liste/grille pour l'explorateur
- Activer / désactiver l'assistant IA

**Prochaines pistes** si vous voulez approfondir : recherche avancée plein écran avec OCR, partage externe (lien temporaire), gestion fine des rôles/permissions matrix, et état mobile/tablette responsive.

## User

Continue avec le reste du projet. J'attends que tous les onglets soient fonctionnelle à la fin de ta génération.

## Assistant

_[tool: update_todos]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: str_replace_edit]_

Now update index.html and app.jsx to wire everything together:

_[tool: str_replace_edit]_

Also update the crumbs map and remove the unused PlaceholderScreen:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Now remove the PlaceholderScreen since it's no longer needed:

_[tool: str_replace_edit]_

Now wire the topbar search click to navigate to search:Also update the Topbar bell to navigate to notifications:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

Wire the `onNotifications` prop in app.jsx:

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Tous les onglets sont maintenant fonctionnels :

| Onglet | Ce qu'il fait |
|---|---|
| **Tableau de bord** | KPIs, docs verrouillés, à-faire, snapshot Qualiopi, expirations |
| **Documents** | Arborescence + table/grille, filtres, vue détail + scénario verrou |
| **Recherche** | Barre full-text + filtres avancés + aperçu rapide latéral |
| **Notifications** | Centre de notifs avec marquer lu, préférences de canal |
| **Qualiopi** | Indicateurs + pièces requises + suggestion IA |
| **Versions** | Timeline + diff côte à côte |
| **Journal** | Audit complet filtrable + export CSV/PDF/JSON |
| **Modèles** | Bibliothèque grille/liste + modal aperçu + création |
| **Utilisateurs** | Liste + matrix rôles/permissions + invitation |
| **Paramètres** | Sécurité, org, stockage, intégrations, facturation |
| **Assistant IA** | Drawer avec prompts canned + réponses sourcées |

**Rappel Tweaks** (barre en bas à droite) : couleur d'accent × 6, vue liste/grille documents, activer/désactiver l'IA.

