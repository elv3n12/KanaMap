# AGENT.md

## Mission générale

Tu construis une application web de cartographie citoyenne européenne dédiée au signalement, à la documentation et à l’analyse de la circulation de cannabinoïdes psychoactifs émergents, notamment les cannabinoïdes synthétiques et semi-synthétiques.

Cette application ne doit PAS être conçue comme un outil pour trouver où acheter des substances.

Elle doit être conçue comme un observatoire civique, sanitaire, journalistique et institutionnel permettant de rendre visible un marché opaque, mouvant et insuffisamment contrôlé.

Le projet vise à documenter :

- la présence de cannabinoïdes psychoactifs émergents dans des commerces, e-shops, tabacs, boutiques CBD, automates ou autres circuits ;
- les molécules signalées ;
- les formes commerciales des produits ;
- les allégations marketing ;
- les effets indésirables rapportés ;
- les zones géographiques concernées ;
- le niveau de preuve associé à chaque signalement ;
- l’évolution du marché dans le temps ;
- les failles de régulation française et européenne.

Phrase directrice du projet :

> Cette plateforme ne référence pas des points de vente pour faciliter l’achat. Elle documente des signalements publics afin de rendre visible la circulation de cannabinoïdes psychoactifs émergents, leurs formes commerciales, leurs risques rapportés et les défaillances de contrôle du marché.

---

## Positionnement politique et éditorial

L’application doit toujours être pensée comme :

- un outil d’alerte sanitaire ;
- un outil de documentation citoyenne ;
- un outil d’enquête journalistique ;
- un outil d’analyse de marché gris ;
- un outil d’interpellation des institutions françaises et européennes ;
- un outil de réduction des risques par la transparence.

Elle ne doit jamais ressembler à :

- un annuaire de points de vente ;
- un comparateur de prix ;
- une marketplace ;
- une application de bons plans ;
- une application de géolocalisation pour acheter ;
- un outil de promotion commerciale pour les boutiques.

Le ton de l’interface doit être sérieux, sobre, institutionnel, civique, documenté.

Ne pas employer de vocabulaire incitatif comme :

- “trouver” ;
- “acheter” ;
- “bon plan” ;
- “stock disponible” ;
- “promo” ;
- “meilleur prix” ;
- “itinéraire” ;
- “disponible près de vous” ;
- “où se procurer”.

Préférer :

- “signaler” ;
- “documenter” ;
- “observer” ;
- “alerter” ;
- “cartographier” ;
- “niveau de preuve” ;
- “effets rapportés” ;
- “zone de signalement” ;
- “produit observé” ;
- “substance déclarée” ;
- “allégation commerciale”.

---

## Nom de travail

Nom provisoire de l’application :

**Cannabinoid Observatory Europe**

Autres noms possibles :

- CartoNoids
- EuroNoid Watch
- Cannalerte
- Observatoire Européen des Cannabinoïdes Émergents
- Cannabinoid Risk Map

Le code doit permettre de changer facilement le nom du projet.

---

## Fonctionnalités principales

### 1. Authentification utilisateur

Les utilisateurs doivent pouvoir créer un compte avec :

- email ;
- mot de passe ;
- acceptation des conditions d’utilisation ;
- acceptation d’une charte de contribution.

Prévoir plusieurs rôles :

- utilisateur standard ;
- contributeur vérifié ;
- modérateur ;
- administrateur ;
- institution ou journaliste vérifié, éventuellement plus tard.

Les utilisateurs non connectés peuvent consulter une version limitée de la carte.

Les utilisateurs connectés peuvent soumettre des signalements.

Les modérateurs et administrateurs valident, masquent, corrigent ou enrichissent les signalements.

---

## 2. Carte publique

La carte doit afficher des signalements géographiques.

Important : la carte publique ne doit pas afficher par défaut des adresses exactes permettant de se rendre facilement dans un point de vente.

Utiliser une logique de granularité :

- ville ;
- arrondissement ;
- quartier approximatif ;
- zone géographique floutée ;
- cluster régional.

Les coordonnées exactes peuvent être stockées en base uniquement si nécessaire pour modération ou analyse, mais elles ne doivent pas être exposées publiquement sans validation stricte.

La carte doit permettre de filtrer par :

- pays ;
- ville ;
- type de lieu ;
- molécule signalée ;
- type de produit ;
- niveau de preuve ;
- date du signalement ;
- effets indésirables rapportés ;
- statut de modération ;
- catégorie de risque.

La carte doit mettre en avant le phénomène, pas l’accès au produit.

Ne pas intégrer :

- calcul d’itinéraire ;
- bouton “s’y rendre” ;
- lien Google Maps vers le lieu exact ;
- horaires commerciaux ;
- téléphone de boutique ;
- lien direct d’achat ;
- publicité ;
- classement par prix ;
- classement par proximité.

---

## 3. Création d’un signalement

Un signalement doit contenir idéalement :

### Informations géographiques

- pays ;
- ville ;
- quartier ou zone ;
- adresse exacte facultative, réservée à la modération ;
- type de lieu.

Types de lieux possibles :

- boutique CBD ;
- tabac ;
- e-shop ;
- automate ;
- réseau social ;
- marché informel ;
- événement ;
- autre.

Pour les marchés informels ou points de deal, ne jamais publier d’adresse exacte. Utiliser seulement une zone approximative.

### Informations produit

- nom commercial du produit ;
- marque ;
- molécule annoncée ;
- molécule suspectée ;
- composition indiquée ;
- type de produit ;
- forme d’administration ;
- prix observé ;
- quantité ;
- photo de l’emballage ;
- capture d’écran éventuelle ;
- lien commercial éventuel, visible uniquement par les modérateurs ou transformé en archive non cliquable ;
- date d’observation.

Types de produits :

- fleur ;
- résine ;
- vape ;
- cartouche ;
- liquide ;
- bonbon ;
- huile ;
- gélule ;
- poudre ;
- spray ;
- autre.

Molécules à prévoir dans la taxonomie initiale :

- CBD ;
- THC ;
- HHC ;
- HHC-O ;
- HHC-P ;
- THCP ;
- H4CBD ;
- 10-OH-HHC ;
- 8-OH-HHC ;
- T9HC ;
- THV-N10 ;
- STV10 ;
- Delta-8-THC ;
- Delta-10-THC ;
- CBN ;
- CBG ;
- Muscimol ;
- molécule inconnue ;
- mélange non identifié ;
- autre.

La taxonomie doit être extensible facilement.

### Informations marketing

Le formulaire doit permettre de cocher des allégations commerciales observées :

- “légal” ;
- “naturel” ;
- “issu du CBD” ;
- “alternative au THC” ;
- “sans risque” ;
- “non addictif” ;
- “relaxant” ;
- “puissant” ;
- “conforme UE” ;
- “effet cannabis légal” ;
- “moins dangereux que le THC” ;
- “nouvelle molécule” ;
- “premium” ;
- “pas détectable” ;
- autre.

Ces allégations sont un élément central du projet.

### Effets indésirables

L’utilisateur peut déclarer des effets indésirables liés à un produit.

Effets proposés :

- anxiété ;
- crise de panique ;
- palpitations ;
- tachycardie ;
- malaise ;
- nausées ;
- vomissements ;
- confusion ;
- hallucinations ;
- perte de contrôle ;
- somnolence excessive ;
- irritabilité ;
- insomnie ;
- sueurs nocturnes ;
- cauchemars ;
- symptômes de sevrage ;
- craving ;
- consommation compulsive ;
- besoin de reprendre au réveil ;
- passage aux urgences ;
- appel à un centre antipoison ;
- interaction médicamenteuse suspectée ;
- autre.

Les données de santé doivent être traitées avec une prudence maximale.

Ne jamais afficher publiquement de données permettant d’identifier une personne.

---

## 4. Niveau de preuve

Chaque signalement doit avoir un niveau de preuve.

### Niveau 1 : témoignage simple

Signalement déclaratif sans pièce jointe.

### Niveau 2 : preuve visuelle

Photo d’emballage, capture d’écran, ticket, étiquette, vitrine.

### Niveau 3 : documentation commerciale

Fiche produit, publicité, page e-commerce, argumentaire marketing.

### Niveau 4 : analyse indépendante

Résultat de laboratoire, chromatographie, test produit, rapport associatif.

### Niveau 5 : signal sanitaire documenté

Effet indésirable grave, passage médical, déclaration sanitaire, rapport institutionnel ou cas solidement documenté.

La carte doit rendre visible ce niveau de preuve.

Un signalement faible ne doit jamais être présenté comme une vérité définitive.

Utiliser des labels comme :

- “à vérifier” ;
- “documenté partiellement” ;
- “documenté” ;
- “analyse disponible” ;
- “signal sanitaire associé” ;
- “contesté” ;
- “retiré” ;
- “corrigé”.

---

## 5. Modération

La modération est centrale.

Tout nouveau signalement doit passer par un statut :

- brouillon ;
- soumis ;
- en attente de vérification ;
- publié en version limitée ;
- publié ;
- rejeté ;
- archivé ;
- contesté.

Les modérateurs doivent pouvoir :

- masquer l’adresse exacte ;
- flouter la zone ;
- retirer les informations incitatives ;
- corriger une molécule ;
- ajouter une note ;
- demander plus de preuves ;
- changer le niveau de preuve ;
- associer plusieurs signalements au même produit ;
- associer plusieurs signalements à une même marque ;
- archiver un produit retiré du marché.

Règles de modération impératives :

- ne pas publier d’informations facilitant l’achat ;
- ne pas publier de liens directs vers l’achat ;
- ne pas publier de coordonnées permettant de contacter un vendeur ;
- ne pas publier d’horaires ;
- ne pas publier de message promotionnel ;
- ne pas laisser une boutique utiliser la plateforme comme publicité ;
- ne pas publier d’adresse exacte pour un point de marché informel ;
- ne pas publier de données personnelles ;
- ne pas publier de propos diffamatoires non documentés.

---

## 6. Droit de réponse

Prévoir un système permettant à un commerce ou une marque de demander :

- une correction ;
- un retrait ;
- l’ajout d’une réponse ;
- la mention qu’un produit a été retiré ;
- la contestation d’un signalement ;
- la transmission de documents justificatifs.

Un droit de réponse ne doit pas devenir une publicité.

Les réponses publiques doivent être modérées.

Exemple de réponse acceptable :

> L’établissement indique ne plus vendre ce produit depuis le 12 mars 2026.

Exemple de réponse à refuser :

> Venez découvrir notre nouvelle gamme garantie légale.

---

## 7. Page produit

Chaque produit signalé peut avoir une fiche.

La fiche produit doit afficher :

- nom commercial ;
- marque ;
- molécule annoncée ;
- molécule suspectée ;
- type de produit ;
- pays de signalement ;
- nombre de signalements ;
- période d’apparition ;
- allégations marketing associées ;
- effets indésirables rapportés ;
- niveau de preuve moyen ;
- documents associés ;
- statut actuel.

Ne jamais afficher la fiche comme une recommandation.

Pas de notation positive du produit.

Pas d’avis consommateurs du type “effet agréable”, “bon goût”, “meilleur produit”.

Les témoignages doivent être orientés risques, effets, dépendance, confusion d’étiquetage, sevrage, problème sanitaire.

---

## 8. Tableau de bord institutionnel

Prévoir une section de rapports et statistiques.

Objectif : produire des éléments exploitables par :

- ANSM ;
- DGCCRF ;
- ARS ;
- MILDECA ;
- douanes ;
- EUDA ;
- Parlement européen ;
- Commission européenne ;
- journalistes ;
- associations de réduction des risques ;
- chercheurs.

Tableaux utiles :

- nombre de signalements par pays ;
- nombre de signalements par ville ;
- évolution temporelle par molécule ;
- apparition de nouvelles molécules ;
- types de produits les plus fréquents ;
- allégations marketing les plus fréquentes ;
- effets indésirables les plus rapportés ;
- lieux de vente les plus signalés par catégorie ;
- prix moyens observés par type de produit ;
- comparaison entre dates d’interdiction et apparition de molécules de remplacement ;
- signalements avec analyse laboratoire ;
- signalements avec effets graves.

Prévoir export :

- CSV ;
- JSON ;
- PDF rapport ;
- image de carte ;
- dossier institutionnel.

Les exports publics doivent anonymiser les données sensibles.

---

## 9. Charte utilisateur

Lors de l’inscription, l’utilisateur doit accepter une charte.

La charte doit dire clairement :

- la plateforme sert à documenter un phénomène sanitaire et commercial ;
- elle ne sert pas à acheter ou vendre des substances ;
- les signalements doivent être sincères ;
- les accusations doivent être documentées ;
- les données personnelles d’autrui sont interdites ;
- les liens d’achat directs sont interdits ;
- la publicité est interdite ;
- les informations facilitant l’accès à des substances dangereuses peuvent être masquées ;
- les signalements mensongers ou malveillants peuvent être supprimés ;
- les comptes abusifs peuvent être suspendus.

---

## 10. Page d’accueil

La page d’accueil doit expliquer très clairement le projet.

Message principal :

> Un observatoire citoyen pour documenter la circulation des cannabinoïdes psychoactifs émergents en Europe.

Sous-message :

> Cette carte ne facilite pas l’achat. Elle rend visible un marché opaque, rapide et insuffisamment contrôlé, afin d’aider les citoyens, journalistes, chercheurs et institutions à mieux comprendre les risques.

Boutons principaux :

- “Consulter la carte”
- “Signaler un produit”
- “Déclarer un effet indésirable”
- “Voir les tendances”
- “Comprendre le projet”

Ne pas mettre :

- “Trouver un produit”
- “Voir les boutiques près de moi”
- “Comparer les prix”
- “Acheter”
- “Disponible autour de vous”

---

## 11. UX de la carte

Sur la carte :

- utiliser des clusters plutôt que des pins ultra-précis ;
- privilégier les zones de signalement ;
- indiquer la densité ;
- indiquer le niveau de preuve ;
- indiquer les molécules dominantes ;
- indiquer les effets rapportés ;
- permettre de filtrer par période.

Exemple de popup acceptable :

> Zone : Paris 11e  
> Signalements : 4  
> Molécules signalées : 10-OH-HHC, T9HC  
> Produits : fleurs, vape  
> Niveau de preuve maximal : photo d’emballage  
> Effets rapportés : insomnie, anxiété, symptômes de sevrage  
> Statut : en cours de vérification

Exemple de popup à éviter :

> Boutique X  
> Adresse exacte  
> 10-OH-HHC disponible  
> 12,90 €  
> Ouvert jusqu’à 22h  
> Itinéraire

---

## 12. Données sensibles

Traiter avec prudence :

- données de santé ;
- adresses exactes ;
- photos contenant des personnes ;
- tickets contenant des informations personnelles ;
- noms de vendeurs ;
- numéros de téléphone ;
- réseaux sociaux privés ;
- informations sur marchés informels.

Prévoir :

- anonymisation ;
- floutage ;
- suppression des métadonnées EXIF des images ;
- masquage des visages si nécessaire ;
- suppression automatique des numéros de téléphone et emails dans les champs publics ;
- séparation entre données publiques et données de modération.

---

## 13. Sécurité juridique et réputationnelle

Le projet doit pouvoir être défendu publiquement.

Toujours privilégier :

- le conditionnel ;
- les statuts de preuve ;
- la documentation ;
- la modération ;
- le droit de réponse ;
- l’anonymisation ;
- l’absence d’incitation.

Éviter :

- accusations non sourcées ;
- listes nominatives agressives ;
- signalements non modérés publiés comme faits ;
- fiches boutiques assimilables à des pages commerciales ;
- liens directs vers l’achat ;
- géolocalisation précise des marchés informels.

---

## 14. Administration

Prévoir un back-office pour administrateurs.

Fonctions :

- gestion des utilisateurs ;
- gestion des rôles ;
- gestion des signalements ;
- gestion des produits ;
- gestion des marques ;
- gestion des molécules ;
- gestion des droits de réponse ;
- gestion des effets indésirables ;
- gestion des documents ;
- exports ;
- journal d’audit ;
- statistiques ;
- modération des contenus.

Toutes les actions sensibles doivent être historisées :

- création ;
- modification ;
- publication ;
- suppression ;
- changement de statut ;
- changement de niveau de preuve ;
- masquage d’adresse ;
- validation de document.

---

## 15. Structure de données conceptuelle

Prévoir au minimum les entités suivantes :

- User
- Role
- Report
- Location
- Product
- Brand
- Molecule
- ProductType
- MarketingClaim
- AdverseEffect
- Evidence
- ModerationStatus
- ProofLevel
- RightOfReply
- InstitutionExport
- AuditLog

Chaque signalement doit pouvoir être relié à :

- un utilisateur ;
- une localisation approximative ;
- un produit ;
- une ou plusieurs molécules ;
- une ou plusieurs preuves ;
- une ou plusieurs allégations marketing ;
- un ou plusieurs effets indésirables ;
- un statut de modération ;
- un niveau de preuve.

---

## 16. Principes de design

Design souhaité :

- sobre ;
- lisible ;
- sérieux ;
- institutionnel ;
- moderne ;
- non anxiogène mais ferme ;
- compatible mobile ;
- accessible ;
- utilisable par journalistes et institutions.

Éviter les codes visuels :

- cannabis festif ;
- feuille de cannabis partout ;
- couleurs fluo ;
- ambiance headshop ;
- esthétique marketplace ;
- badges promotionnels ;
- gamification de consommation.

Préférer :

- cartographie claire ;
- tons neutres ;
- visualisation de données ;
- pictogrammes sanitaires ;
- badges de preuve ;
- badges de risque ;
- tableaux exportables.

---

## 17. Écran “Déclarer un effet indésirable”

Créer une entrée spécifique pour les personnes ayant consommé un produit.

Ce formulaire doit être prudent et non médicalisant.

Texte d’avertissement :

> Cette déclaration ne remplace pas un avis médical. En cas de malaise grave, de détresse psychologique, de palpitations importantes, de confusion, de douleur thoracique ou de danger immédiat, contactez les urgences ou un professionnel de santé.

Le formulaire doit permettre :

- produit consommé ;
- molécule annoncée ;
- molécule suspectée ;
- pays ;
- période approximative ;
- effets ressentis ;
- durée des effets ;
- symptômes de sevrage ;
- recours médical ou non ;
- documents éventuels ;
- souhait d’être recontacté ou non.

Aucune donnée nominative ne doit être publique.

---

## 18. Page “Comprendre”

Prévoir une page pédagogique expliquant :

- ce qu’est un cannabinoïde ;
- différence entre cannabinoïde naturel, synthétique et semi-synthétique ;
- pourquoi le marché évolue vite ;
- pourquoi les noms commerciaux peuvent être trompeurs ;
- pourquoi “légal” ne signifie pas “sans risque” ;
- pourquoi les fleurs pulvérisées ou altérées posent problème ;
- pourquoi la régulation européenne est fragmentée ;
- pourquoi la plateforme existe ;
- comment les données sont modérées ;
- comment les institutions peuvent utiliser les données.

Rester factuel, prudent et sourcé.

---

## 19. Page “Institutions et journalistes”

Prévoir une page destinée aux institutions.

Contenu :

- objectif de l’observatoire ;
- méthodologie ;
- niveaux de preuve ;
- politique de modération ;
- politique d’anonymisation ;
- types d’exports disponibles ;
- contact ;
- possibilité de demander un accès vérifié ;
- possibilité de signaler une erreur ;
- possibilité de demander un rapport.

Message :

> Nous souhaitons aider les institutions à mieux voir un phénomène qui évolue plus vite que les mécanismes réglementaires classiques.

---

## 20. Interdictions fonctionnelles absolues

Ne jamais coder :

- achat direct ;
- panier ;
- paiement ;
- lien affilié ;
- mise en relation acheteur-vendeur ;
- messagerie entre utilisateurs pour trouver un produit ;
- bouton “contacter le vendeur” ;
- bouton “itinéraire” ;
- classement des meilleurs produits ;
- avis positifs sur les effets ;
- système de recommandation de produits ;
- système d’alerte “nouveau produit disponible près de vous” ;
- scraping automatisé de boutiques pour aider à acheter ;
- carte précise de points de deal ;
- push notification de disponibilité.

Si une demande future va dans cette direction, refuser ou proposer une alternative orientée documentation, santé publique et analyse institutionnelle.

---

## 21. Fonctionnalités acceptables mais prudentes

Ces fonctionnalités sont acceptables uniquement si elles servent l’enquête :

- prix observé comme donnée statistique ;
- marque observée ;
- photo d’emballage ;
- adresse exacte stockée uniquement côté modération ;
- lien source archivé mais non promotionnel ;
- nom de boutique masqué ou partiellement affiché selon niveau de preuve ;
- droit de réponse ;
- export institutionnel anonymisé ;
- analyse temporelle du marché ;
- heatmap par molécule ;
- classement des molécules les plus signalées, mais pas des vendeurs.

---

## 22. Priorité de développement MVP

Construire d’abord un MVP simple :

### MVP 1

- authentification ;
- page d’accueil ;
- carte avec zones approximatives ;
- formulaire de signalement ;
- formulaire d’effet indésirable ;
- niveaux de preuve ;
- upload de preuves ;
- back-office de modération ;
- publication après validation ;
- filtres simples ;
- page “Comprendre” ;
- page “Institutions”.

### MVP 2

- statistiques avancées ;
- exports CSV/JSON ;
- fiches produits ;
- fiches molécules ;
- droit de réponse ;
- anonymisation avancée ;
- rapports PDF ;
- comptes institutionnels.

### MVP 3

- analyses temporelles ;
- détection de nouvelles molécules ;
- système de veille ;
- comparaisons réglementaires par pays ;
- API publique anonymisée ;
- partenariat avec associations ou chercheurs.

---

## 23. Critère de réussite

L’application est réussie si elle permet de répondre clairement à ces questions :

- quelles molécules circulent ?
- dans quels pays ?
- sous quelles formes ?
- avec quelles promesses commerciales ?
- avec quels effets rapportés ?
- avec quel niveau de preuve ?
- à quelle vitesse le marché change-t-il ?
- quelles substances remplacent celles qui sont interdites ?
- quels produits semblent poser le plus de problèmes ?
- quelles zones nécessitent une attention institutionnelle ?
- comment documenter le phénomène sans faciliter l’achat ?

---

## 24. Règle suprême de produit

À chaque décision de design, d’interface ou de fonctionnalité, appliquer ce test :

> Est-ce que cette fonctionnalité aide surtout à documenter, alerter, comprendre et réguler ?  
> Ou est-ce qu’elle aide surtout à localiser, choisir, comparer ou acheter ?

Si elle aide surtout à acheter, ne pas la coder.

Si elle aide à documenter le phénomène sans faciliter l’accès aux produits, elle peut être envisagée.

---

## 25. Ton éditorial de l’application

Ton souhaité :

- sérieux ;
- clair ;
- civique ;
- ferme ;
- prudent ;
- non moralisateur ;
- orienté santé publique ;
- compatible avec une lecture institutionnelle.

Ne pas culpabiliser les consommateurs.

Ne pas présenter les usagers comme des délinquants.

Ne pas présenter toutes les boutiques comme coupables.

Ne pas faire de promesse médicale.

Ne pas affirmer sans preuve.

Préférer une posture :

> Nous documentons. Nous vérifions. Nous rendons visible. Nous alertons.

---

## 26. Livrables attendus de l’agent

L’agent doit produire :

- une application fonctionnelle ;
- un README clair ;
- un modèle de données lisible ;
- une structure de rôles ;
- un système de modération ;
- une politique d’anonymisation ;
- des textes d’interface prudents ;
- des données de démonstration fictives ;
- des tests sur les règles critiques ;
- une documentation expliquant les limites du projet.

Les données de démonstration ne doivent jamais utiliser de vraies boutiques ou de vraies personnes.

Utiliser uniquement des exemples fictifs.

---

## 27. Données fictives pour tests

Exemples autorisés :

- “Boutique fictive A”
- “Produit fictif X”
- “Molécule annoncée : 10-OH-HHC”
- “Ville : Paris, zone approximative”
- “Effets rapportés : insomnie, anxiété”
- “Niveau de preuve : photo d’emballage fictive”

Ne pas utiliser de vraies enseignes dans les seed data.

---

## 28. Conclusion de mission

Construis une application qui révèle un marché sans l’alimenter.

Le but n’est pas de faire une carte pour trouver des cannabinoïdes.

Le but est de faire une carte si claire que les institutions ne puissent plus prétendre ne pas voir le problème.