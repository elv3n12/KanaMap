# Politique de modération

La modération est centrale : la plateforme documente un phénomène sanitaire et commercial sans faciliter l'achat.

## Règles impératives

- Ne pas publier d'informations facilitant l'achat.
- Ne pas publier de liens directs vers l'achat.
- Ne pas publier de coordonnées permettant de contacter un vendeur.
- Ne pas publier d'horaires commerciaux.
- Ne pas publier de message promotionnel.
- Ne pas laisser une boutique utiliser la plateforme comme publicité.
- Ne pas publier d'adresse exacte pour un marché informel.
- Ne pas publier de données personnelles.
- Ne pas publier de propos diffamatoires non documentés.

## Statuts

- `DRAFT` : brouillon interne.
- `SUBMITTED` : soumis.
- `PENDING_REVIEW` : en attente de vérification.
- `PUBLISHED_LIMITED` : visible uniquement en agrégat de zone.
- `PUBLISHED` : fiche publique anonymisée.
- `REJECTED` : rejeté.
- `CONTESTED` : contesté et à revoir.

## Actions modérateur

Les modérateurs peuvent publier, publier en version limitée, rejeter, supprimer définitivement, contester, masquer l'adresse, changer le niveau de preuve, demander davantage d'éléments ou ajouter une note. Les signalements ne sont jamais archivés : ils sont soit publiés, soit supprimés.

Chaque action sensible crée une entrée `ModerationAction` et une entrée `AuditLog`.
