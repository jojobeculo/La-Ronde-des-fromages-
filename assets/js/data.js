/* =========================================================================
   Au Buron — données du site (fromages, recettes, boutique)
   ✏️ À PERSONNALISER : tout ce qui est ici s’affiche directement sur le site.
   Les prix sont indicatifs (€ TTC au kilo) : ajustez-les à vos tarifs réels.
   ========================================================================= */
window.LB_DATA = {
  shop: {
    name: 'Au Buron',
    address: '9, rue des Saulées',
    city: '63400 Chamalières',
    phone: '04 73 37 88 85',
    phoneHref: 'tel:+33473378885',
    email: 'contact@example.com', // ✏️ À PERSONNALISER : l’adresse qui reçoit les commandes
    maps: 'https://www.google.com/maps/search/?api=1&query=Le+Buron+9+rue+des+Saul%C3%A9es+63400+Chamali%C3%A8res',
    // Horaires relevés sur PagesJaunes (à vérifier). 0 = dimanche. Plages « HH:MM-HH:MM ».
    hours: {
      1: ['08:00-12:00', '15:00-19:00'],
      2: ['07:00-12:30', '14:30-19:00'],
      3: ['07:00-12:30', '14:30-19:00'],
      4: ['07:00-12:30', '14:30-19:00'],
      5: ['07:00-19:00'],
      6: ['07:00-19:00'],
      0: [],
    },
  },

  /* ---------- Les fromages ----------
     art : symbole SVG (sn, ca, sa, fa, ba, ga = dessins dédiés ; tall, disc, blue, soft, goat, fresh = dessins génériques colorés par « colors »)
     photo : fichier dans assets/photos (photo d’illustration) */
  families: {
    pressee: 'Pâtes pressées',
    persillee: 'Persillés',
    fleurie: 'Croûtes fleuries & lavées',
    chevre: 'Chèvres & brebis',
    fraiche: 'Frais & à cuisiner',
  },
  cheeses: [
    {
      id: 'saint-nectaire', name: 'Saint-Nectaire fermier', family: 'pressee', aop: true, price: 26,
      milk: 'Vache, lait cru', region: 'Monts Dore & Cézallier', aging: '28 jours minimum, souvent 6 à 8 semaines',
      art: 'sn', photo: 'fr-saint-nectaire',
      short: 'Souple et onctueux, un goût de noisette et de sous-bois.',
      text: 'Fabriqué deux fois par jour à la ferme, juste après la traite, puis affiné en cave sur des planches. Sa croûte fleurie de moisissures blanches, jaunes et rouges protège une pâte souple qui fond sur la langue. Le fermier se reconnaît à sa plaque de caséine verte ovale, le laitier à sa plaque carrée.',
      taste: 'Noisette, champignon, cave humide',
      pairing: 'Un Côtes-d’Auvergne rouge, du pain de campagne',
    },
    {
      id: 'cantal-jeune', name: 'Cantal jeune', family: 'pressee', aop: true, price: 17,
      milk: 'Vache', region: 'Cantal & Monts du Cantal', aging: '30 à 60 jours',
      art: 'ca', photo: 'fr-cantal-jeune',
      short: 'Doux, lactique, à la pâte souple et fraîche.',
      text: 'L’un des plus vieux fromages de France : on dit que Pline l’Ancien le vantait déjà. Jeune, le Cantal garde la douceur du lait et une texture tendre, idéale pour le goûter des enfants, les sandwichs ou la cuisine.',
      taste: 'Beurre frais, crème, une pointe d’acidité',
      pairing: 'Une pomme croquante, un jus de pomme fermier',
    },
    {
      id: 'cantal-entre-deux', name: 'Cantal entre-deux', family: 'pressee', aop: true, price: 20,
      milk: 'Vache', region: 'Cantal & Monts du Cantal', aging: '90 à 210 jours',
      art: 'ca', photo: 'fr-cantal-entre-deux',
      short: 'Le juste milieu : plus de caractère, toujours fondant.',
      text: 'À mi-chemin entre la douceur du jeune et la puissance du vieux, l’entre-deux développe une croûte grise et une pâte plus jaune. C’est le Cantal de tous les jours, celui qu’on coupe en larges tranches sur le pain.',
      taste: 'Noisette, lait chaud, finale légèrement piquante',
      pairing: 'Des noix, un Saint-Pourçain rouge',
    },
    {
      id: 'cantal-vieux', name: 'Cantal vieux', family: 'pressee', aop: true, price: 25,
      milk: 'Vache', region: 'Cantal & Monts du Cantal', aging: 'Plus de 240 jours',
      art: 'ca', photo: 'fr-cantal-vieux',
      short: 'Franc, puissant et piquant, pour les amateurs.',
      text: 'Après plus de huit mois de cave, la pâte se fait cassante et les arômes s’intensifient. Un fromage de caractère à déguster en fines lamelles, ou râpé sur une soupe au fromage.',
      taste: 'Puissant, poivré, sous-bois',
      pairing: 'Un rouge charpenté, du pain de seigle',
    },
    {
      id: 'salers', name: 'Salers', family: 'pressee', aop: true, price: 30,
      milk: 'Vache, lait cru', region: 'Monts du Cantal', aging: '3 mois minimum, jusqu’à 18 mois et plus',
      art: 'sa', photo: 'fr-salers',
      short: 'Le fromage des estives, fruité et puissant.',
      text: 'Fabriqué uniquement à la ferme, du 15 avril au 15 novembre, quand les vaches pâturent l’herbe et les fleurs des montagnes. Le lait est travaillé dans la gerle, une cuve en bois. Chaque meule porte une plaque rouge « Salers ».',
      taste: 'Fruité, herbacé, notes de fleurs et de noisette',
      pairing: 'Un Côtes-d’Auvergne Chanturgue',
    },
    {
      id: 'laguiole', name: 'Laguiole', family: 'pressee', aop: true, price: 29,
      milk: 'Vache, lait cru', region: 'Plateau de l’Aubrac', aging: '4 mois minimum',
      art: 'tall', colors: { rind: '#cdb48a', top: '#d9c39d', paste: '#fbe08c', spot: '#b89a68' }, photo: 'fr-laguiole',
      short: 'Le cousin de l’Aubrac, à la pâte souple et parfumée.',
      text: 'Né dans les burons de l’Aubrac, le Laguiole est fabriqué avec le lait cru des vaches du plateau. Sa croûte épaisse est frappée du taureau et du nom « Laguiole ». Sa pâte, un peu plus souple que le Cantal, est très aromatique.',
      taste: 'Lactique, légèrement acidulé, notes d’herbe',
      pairing: 'Un Marcillac, du pain de campagne',
    },
    {
      id: 'murol', name: 'Murol', family: 'pressee', aop: false, price: 21,
      milk: 'Vache', region: 'Murol, Puy-de-Dôme', aging: 'Environ 5 semaines',
      art: 'disc', colors: { rind: '#e7a46a', top: '#eeb67f', paste: '#fde6a4', spot: '#d78c55' }, photo: null,
      short: 'Une couronne douce et fondante, percée en son centre.',
      text: 'Ce disque à la croûte orangée est reconnaissable entre tous : on retire son cœur, que l’on vend à part sous le nom de Murolait. Sa pâte est souple et douce, parfaite pour les enfants et les plateaux familiaux.',
      taste: 'Doux, lacté, légèrement noisette',
      pairing: 'Un blanc sec d’Auvergne, des raisins frais',
    },
    {
      id: 'fourme-ambert', name: 'Fourme d’Ambert', family: 'persillee', aop: true, price: 19,
      milk: 'Vache', region: 'Monts du Forez & Livradois', aging: '28 jours minimum',
      art: 'fa', photo: 'fr-fourme-ambert',
      short: 'L’un des bleus les plus doux, crémeux et fruité.',
      text: 'Haute et élancée, la Fourme d’Ambert est fabriquée sur les hauteurs du Forez. Sa pâte ivoire, délicatement persillée, est d’une grande douceur : c’est le bleu idéal pour ceux qui pensent ne pas aimer les bleus.',
      taste: 'Crème, fruit sec, persillage discret',
      pairing: 'Une poire mûre, du miel de châtaignier, un vin moelleux',
    },
    {
      id: 'bleu-auvergne', name: 'Bleu d’Auvergne', family: 'persillee', aop: true, price: 18,
      milk: 'Vache', region: 'Auvergne', aging: '4 semaines minimum',
      art: 'ba', photo: 'fr-bleu-auvergne',
      short: 'Plus corsé que la Fourme, franc et crémeux.',
      text: 'Né vers 1850, raconte-t-on, de l’idée d’Antoine Roussel d’ensemencer son caillé avec la moisissure du pain de seigle. Son persillage généreux lui donne une saveur franche, qui reste onctueuse.',
      taste: 'Franc, salin, crémeux',
      pairing: 'Des figues, un vin liquoreux, du pain aux noix',
    },
    {
      id: 'bleu-causses', name: 'Bleu des Causses', family: 'persillee', aop: true, price: 22,
      milk: 'Vache', region: 'Causses de l’Aveyron et du Lot', aging: '70 jours minimum en caves naturelles',
      art: 'blue', colors: { rind: '#efe2c4', top: '#f5ebd4', paste: '#fbf0d6', vein: '#50665c' }, photo: 'fr-bleu-causses',
      short: 'Affiné dans les caves naturelles des Causses.',
      text: 'Affiné dans des caves creusées dans le calcaire, où les fleurines soufflent un air frais et humide. Sa pâte, un peu plus ferme et jaune que celle des autres bleus, prend des notes profondes de cave.',
      taste: 'Puissant, légèrement salé, notes de cave',
      pairing: 'Un vin de Cahors, des noix fraîches',
    },
    {
      id: 'roquefort', name: 'Roquefort', family: 'persillee', aop: true, price: 34,
      milk: 'Brebis, lait cru', region: 'Roquefort-sur-Soulzon', aging: '90 jours minimum',
      art: 'blue', colors: { rind: '#f4ecdc', top: '#faf4e8', paste: '#fdf8ec', vein: '#3f5a50' }, photo: 'fr-roquefort',
      short: 'Le roi des bleus, au lait cru de brebis.',
      text: 'Fabriqué avec le lait cru des brebis Lacaune et affiné dans les caves de Roquefort-sur-Soulzon. Sa pâte blanche, fondante et très persillée offre une saveur intense et légèrement sucrée.',
      taste: 'Intense, salin, notes de noisette',
      pairing: 'Un Sauternes, des poires, du pain de seigle',
    },
    {
      id: 'brie-meaux', name: 'Brie de Meaux', family: 'fleurie', aop: true, price: 27,
      milk: 'Vache, lait cru', region: 'Île-de-France', aging: '4 semaines minimum',
      art: 'soft', colors: { rind: '#f5efe2', top: '#faf6ec', paste: '#fbe6a8', spot: '#d9b98c' }, photo: 'fr-brie-meaux',
      short: 'Crémeux, fruité, à la croûte fleurie blanche.',
      text: 'Une grande galette à croûte fleurie, coulante à cœur lorsqu’elle est à point. Nous vous la coupons à la demande, en vous indiquant si vous la préférez jeune et crayeuse ou bien faite et fondante.',
      taste: 'Champignon frais, crème, noisette',
      pairing: 'Un Champagne, du pain de campagne',
    },
    {
      id: 'reblochon', name: 'Reblochon de Savoie', family: 'fleurie', aop: true, price: 23,
      milk: 'Vache, lait cru', region: 'Savoie', aging: '15 jours minimum',
      art: 'soft', colors: { rind: '#e8c592', top: '#efd2a6', paste: '#fdeec2', spot: '#d2a56c' }, photo: 'fr-reblochon',
      short: 'Fondant et doux, roi de la tartiflette.',
      text: 'Un petit disque à la croûte lavée, couverte d’un fin duvet blanc. Sa pâte onctueuse a un goût de noisette ; il se déguste tel quel ou fondu dans une tartiflette.',
      taste: 'Noisette, crème, légère amertume de croûte',
      pairing: 'Un vin blanc de Savoie',
    },
    {
      id: 'gaperon', name: 'Gaperon', family: 'fleurie', aop: false, price: 22,
      milk: 'Vache', region: 'Limagne, Puy-de-Dôme', aging: '1 à 2 mois',
      art: 'ga', photo: 'fr-gaperon',
      short: 'Le dôme de la Limagne, à l’ail et au poivre.',
      text: 'Spécialité de la plaine de la Limagne, autrefois faite avec le babeurre (la « gape »). On reconnaît sa forme de dôme, nouée d’un raphia. L’ail et le poivre noir lui donnent un caractère unique.',
      taste: 'Ail, poivre, lait caillé',
      pairing: 'Un rosé de Corent, de la charcuterie fine',
    },
    {
      id: 'chevre-fermier', name: 'Chèvre fermier', family: 'chevre', aop: false, price: 32,
      milk: 'Chèvre, lait cru', region: 'Fermes du Puy-de-Dôme', aging: 'Frais à sec, selon votre goût',
      art: 'goat', colors: { rind: '#f6f0e4', top: '#fbf8f0', paste: '#fffcf4', spot: '#d9cdb4' }, photo: 'fr-chevre',
      short: 'Frais, crémeux ou sec : chaque semaine selon la ferme.',
      text: 'Nous travaillons des fromages de chèvre fermiers, à des degrés d’affinage différents : frais et acidulé, demi-sec et crémeux, ou sec et puissant. Demandez au comptoir ce qui est arrivé cette semaine.',
      taste: 'Acidulé quand il est frais, noisette quand il est sec',
      pairing: 'Un blanc sec, du miel, une salade',
    },
    {
      id: 'comte', name: 'Comté 18 mois', family: 'pressee', aop: true, price: 32,
      milk: 'Vache, lait cru', region: 'Massif du Jura', aging: '18 mois',
      art: 'disc', colors: { rind: '#c99b5c', top: '#d6ad72', paste: '#fbd77a', spot: '#b68548' }, photo: 'fr-comte',
      short: 'Fruité, cristallin, d’une grande longueur.',
      text: 'Un grand classique de la cave, choisi à 18 mois d’affinage : la pâte devient légèrement cristalline, avec de petits grains de tyrosine, et développe des notes de fruits secs et de beurre noisette.',
      taste: 'Fruits secs, beurre noisette, caramel',
      pairing: 'Un vin jaune, des noix',
    },
    {
      id: 'tomme-fraiche', name: 'Tomme fraîche', family: 'fraiche', aop: false, price: 13,
      milk: 'Vache', region: 'Aubrac & Cantal', aging: 'Non affinée',
      art: 'fresh', colors: { rind: '#fbf3df', top: '#fdf8ec', paste: '#fdf8ec', spot: '#e9dcc0' }, photo: null,
      short: 'Le secret de la truffade et de l’aligot.',
      text: 'Un caillé frais, simplement pressé et non affiné. Fondu, il devient élastique et file sur des mètres : c’est l’ingrédient indispensable de l’aligot et de la truffade. Comptez environ 100 g par personne.',
      taste: 'Lait frais, légèrement acidulé',
      pairing: 'En truffade avec une salade verte',
    },
  ],

  /* ---------- Les recettes ---------- */
  recipeTypes: { plat: 'Plats', entree: 'Entrées & salades', dessert: 'Desserts', apero: 'Apéro & plateaux' },
  recipes: [
    {
      id: 'truffade', name: 'Truffade', type: 'plat', region: 'Cantal', serves: 4, prep: 15, cook: 35, level: 'Facile',
      photo: 'truffade', art: 'truffade', cheeses: ['tomme-fraiche', 'cantal-jeune'],
      intro: 'Le plat des buronniers : des pommes de terre dorées à la graisse, liées par la tomme fraîche qui file. Simple, généreux, inoubliable.',
      ingredients: [
        [1000, 'g', 'pommes de terre à chair ferme'],
        [400, 'g', 'tomme fraîche de Cantal'],
        [2, '', 'gousses d’ail'],
        [2, 'c. à soupe', 'graisse de canard (ou saindoux)'],
        [100, 'g', 'lard fumé (facultatif)'],
        [null, '', 'sel, poivre, persil plat'],
      ],
      steps: [
        'Épluchez les pommes de terre, coupez-les en rondelles de 3 mm, rincez-les et séchez-les soigneusement dans un torchon.',
        'Faites chauffer la graisse dans une grande poêle (en fonte si possible). Faites revenir le lard coupé en lardons 3 minutes.',
        'Ajoutez les pommes de terre et laissez-les cuire 25 minutes à feu moyen, en les retournant régulièrement : elles doivent être tendres et bien dorées.',
        'Ajoutez l’ail haché, poivrez. Coupez la tomme en fines lamelles juste avant de l’utiliser.',
        'Baissez le feu, ajoutez la tomme et mélangez délicatement avec une spatule en bois jusqu’à ce qu’elle fonde et commence à filer.',
        'Laissez dorer 2 à 3 minutes sans remuer pour former une croûte, puis faites glisser la truffade dans un plat chaud, comme une omelette.',
      ],
      tip: 'Salez à la toute fin : la tomme et le lard apportent déjà leur sel. Servez avec une salade verte bien vinaigrée et du jambon d’Auvergne.',
    },
    {
      id: 'aligot', name: 'Aligot', type: 'plat', region: 'Aubrac', serves: 4, prep: 15, cook: 35, level: 'Moyen',
      photo: 'aligot', art: 'aligot', cheeses: ['tomme-fraiche', 'laguiole'],
      intro: 'La purée qui file sur un mètre : un spectacle autant qu’un plat. Le secret, c’est le bras, et une tomme bien fraîche.',
      ingredients: [
        [1000, 'g', 'pommes de terre (type bintje)'],
        [400, 'g', 'tomme fraîche de l’Aubrac'],
        [20, 'cl', 'crème fraîche épaisse'],
        [50, 'g', 'beurre'],
        [2, '', 'gousses d’ail'],
        [null, '', 'sel, poivre'],
      ],
      steps: [
        'Faites cuire les pommes de terre épluchées dans l’eau salée avec les gousses d’ail, environ 25 minutes : la pointe d’un couteau doit s’enfoncer sans résistance.',
        'Égouttez et écrasez-les au presse-purée avec l’ail, sans jamais utiliser de mixeur (la purée deviendrait collante).',
        'Remettez la casserole sur feu doux, incorporez le beurre puis la crème en mélangeant.',
        'Ajoutez la tomme coupée en fines lamelles, en trois ou quatre fois, en tournant énergiquement avec une spatule en bois.',
        'Filez l’aligot : soulevez la spatule et dessinez des 8 pendant 8 à 10 minutes, jusqu’à ce que la purée soit lisse, brillante et qu’elle file en longs rubans.',
        'Servez immédiatement, avec une saucisse grillée ou un rôti de porc.',
      ],
      tip: 'L’aligot n’attend pas : faites asseoir vos convives avant de commencer à filer. Gardez la tomme au frais jusqu’au dernier moment.',
    },
    {
      id: 'tarte-poire-fourme', name: 'Tarte poire & Fourme d’Ambert', type: 'dessert', region: 'Livradois-Forez', serves: 6, prep: 20, cook: 35, level: 'Facile',
      photo: 'tarte-poire', art: 'tarte', cheeses: ['fourme-ambert'],
      intro: 'Le sucré de la poire, le crémeux de la Fourme, le croquant des noix : une tarte qui se sert à l’apéritif, en entrée ou au dessert.',
      ingredients: [
        [1, '', 'pâte brisée'],
        [3, '', 'poires bien mûres'],
        [150, 'g', 'Fourme d’Ambert'],
        [3, '', 'œufs'],
        [20, 'cl', 'crème fraîche'],
        [1, 'poignée', 'cerneaux de noix'],
        [null, '', 'poivre, une pincée de muscade'],
      ],
      steps: [
        'Préchauffez le four à 180 °C. Foncez un moule avec la pâte et piquez le fond à la fourchette.',
        'Épluchez les poires, retirez le cœur et coupez-les en fines lamelles. Disposez-les en rosace sur la pâte.',
        'Émiettez la Fourme d’Ambert par-dessus et parsemez de noix grossièrement concassées.',
        'Battez les œufs avec la crème, le poivre et la muscade, puis versez sur la garniture.',
        'Enfournez 35 minutes, jusqu’à ce que la tarte soit bien dorée et la crème prise.',
        'Laissez tiédir 10 minutes avant de servir, avec une salade de mâche à l’huile de noix.',
      ],
      tip: 'Inutile de saler : la Fourme s’en charge. Un filet de miel de châtaignier à la sortie du four, et c’est un dessert.',
    },
    {
      id: 'fondue-auvergnate', name: 'Fondue auvergnate', type: 'plat', region: 'Auvergne', serves: 6, prep: 15, cook: 15, level: 'Facile',
      photo: 'fondue', art: null, cheeses: ['cantal-entre-deux', 'saint-nectaire', 'fourme-ambert'],
      intro: 'Les trois stars de la cave réunies dans le caquelon : la douceur du Saint-Nectaire, le corps du Cantal et une pointe de Fourme.',
      ingredients: [
        [400, 'g', 'Cantal entre-deux'],
        [400, 'g', 'Saint-Nectaire'],
        [150, 'g', 'Fourme d’Ambert'],
        [40, 'cl', 'vin blanc sec d’Auvergne'],
        [1, '', 'gousse d’ail'],
        [1, 'c. à soupe', 'fécule de maïs'],
        [1, '', 'grand pain de campagne rassis'],
        [null, '', 'poivre, noix de muscade'],
      ],
      steps: [
        'Coupez le pain en cubes, chacun avec un morceau de croûte, la veille si possible.',
        'Retirez la croûte des fromages et coupez-les en petits dés.',
        'Frottez l’intérieur du caquelon avec la gousse d’ail coupée en deux. Versez le vin et faites-le chauffer sans bouillir.',
        'Ajoutez les fromages par poignées, en remuant en forme de 8 avec une cuillère en bois, sur feu doux.',
        'Délayez la fécule dans un peu de vin froid, ajoutez-la quand le mélange est lisse. Poivrez, râpez un peu de muscade.',
        'Posez le caquelon sur le réchaud à table, flamme douce. Tournez votre pain dans la fondue en formant des 8 pour qu’elle reste homogène.',
      ],
      tip: 'Comptez 200 g de fromage par personne pour une fondue en plat unique. Le fond gratiné du caquelon, « la religieuse », se partage à la fin.',
    },
    {
      id: 'patranque', name: 'Patranque', type: 'plat', region: 'Auvergne', serves: 4, prep: 15, cook: 20, level: 'Facile',
      photo: 'patranque', art: null, cheeses: ['tomme-fraiche', 'cantal-jeune'],
      intro: 'La recette anti-gaspi des grands-mères auvergnates : du pain rassis, du lait et de la tomme, dorés à la poêle jusqu’à la croûte.',
      ingredients: [
        [400, 'g', 'pain de campagne rassis'],
        [40, 'cl', 'lait entier'],
        [350, 'g', 'tomme fraîche de Cantal'],
        [50, 'g', 'beurre'],
        [2, '', 'gousses d’ail'],
        [null, '', 'sel, poivre, persil'],
      ],
      steps: [
        'Coupez le pain en morceaux et faites-le tremper dans le lait tiède 15 minutes. Pressez-le légèrement.',
        'Faites fondre le beurre dans une poêle avec l’ail haché, sans le laisser brûler.',
        'Ajoutez le pain trempé et écrasez-le à la fourchette en remuant, 5 minutes à feu moyen.',
        'Ajoutez la tomme en fines lamelles et mélangez jusqu’à ce qu’elle file.',
        'Laissez dorer 5 minutes sans remuer, puis retournez la patranque sur une assiette pour dorer l’autre face.',
        'Parsemez de persil et servez bien chaud, avec une salade.',
      ],
      tip: 'Un pain de deux ou trois jours est parfait. Un peu de Cantal jeune râpé avec la tomme donne plus de goût.',
    },
    {
      id: 'croutes-saint-nectaire', name: 'Croûtes au Saint-Nectaire', type: 'apero', region: 'Puy-de-Dôme', serves: 4, prep: 10, cook: 10, level: 'Très facile',
      photo: 'croutes', art: null, cheeses: ['saint-nectaire'],
      intro: 'Des tartines de pain de campagne grillées, couvertes de Saint-Nectaire fondu et de jambon d’Auvergne. Le dîner du dimanche soir.',
      ingredients: [
        [8, '', 'tranches de pain de campagne'],
        [300, 'g', 'Saint-Nectaire fermier'],
        [4, '', 'tranches de jambon cru d’Auvergne'],
        [1, '', 'gousse d’ail'],
        [null, '', 'poivre, quelques noix'],
      ],
      steps: [
        'Préchauffez le four en position gril à 220 °C.',
        'Faites griller légèrement les tranches de pain, puis frottez-les avec la gousse d’ail.',
        'Coupez le Saint-Nectaire en lamelles, sans retirer toute la croûte : elle apporte du goût.',
        'Garnissez chaque tartine d’une demi-tranche de jambon, puis de Saint-Nectaire.',
        'Passez sous le gril 5 à 7 minutes, jusqu’à ce que le fromage soit fondu et légèrement doré.',
        'Poivrez, parsemez de noix concassées et servez avec une salade verte.',
      ],
      tip: 'Sortez le Saint-Nectaire du réfrigérateur une heure avant : il fondra mieux et sera plus parfumé.',
    },
    {
      id: 'salade-bleu-noix', name: 'Salade au Bleu d’Auvergne & noix', type: 'entree', region: 'Auvergne', serves: 4, prep: 15, cook: 0, level: 'Très facile',
      photo: 'salade-noix', art: null, cheeses: ['bleu-auvergne'],
      intro: 'Une salade de saison croquante et fraîche, où le Bleu d’Auvergne fait office de vinaigrette.',
      ingredients: [
        [200, 'g', 'mélange de jeunes pousses ou de mâche'],
        [150, 'g', 'Bleu d’Auvergne'],
        [1, '', 'poire ou pomme croquante'],
        [60, 'g', 'cerneaux de noix'],
        [3, 'c. à soupe', 'huile de noix'],
        [1, 'c. à soupe', 'vinaigre de cidre'],
        [null, '', 'sel, poivre'],
      ],
      steps: [
        'Faites torréfier les noix 3 minutes à la poêle sèche, puis concassez-les grossièrement.',
        'Écrasez 30 g de Bleu d’Auvergne à la fourchette avec le vinaigre, puis ajoutez l’huile de noix pour obtenir une vinaigrette crémeuse.',
        'Coupez le fruit en fines lamelles.',
        'Mélangez la salade avec la vinaigrette juste avant de servir.',
        'Répartissez le fruit, les noix et le reste du Bleu émietté par-dessus. Poivrez.',
      ],
      tip: 'Remplacez le Bleu d’Auvergne par de la Fourme d’Ambert pour une version plus douce.',
    },
    {
      id: 'plateau-du-dimanche', name: 'Le plateau du dimanche', type: 'apero', region: 'Au Buron', serves: 6, prep: 15, cook: 0, level: 'Très facile',
      photo: 'plateau-bois', art: null, cheeses: ['saint-nectaire', 'cantal-entre-deux', 'fourme-ambert', 'salers', 'gaperon'],
      intro: 'Pas vraiment une recette, plutôt une méthode : cinq fromages, du plus doux au plus fort, et quelques accompagnements bien choisis.',
      ingredients: [
        [150, 'g', 'Saint-Nectaire fermier'],
        [150, 'g', 'Cantal entre-deux'],
        [150, 'g', 'Salers'],
        [1, '', 'Gaperon'],
        [150, 'g', 'Fourme d’Ambert'],
        [1, '', 'pain de campagne et pain aux noix'],
        [null, '', 'raisins, figues, noix, miel'],
      ],
      steps: [
        'Sortez les fromages du réfrigérateur une heure avant de servir, dans leur papier.',
        'Choisissez un nombre impair de fromages et variez les familles : une pâte souple, une pâte pressée, un persillé, un fromage de caractère.',
        'Disposez-les dans le sens des aiguilles d’une montre, du plus doux au plus fort, pour guider la dégustation.',
        'Prévoyez un couteau par fromage, surtout pour le bleu.',
        'Ajoutez les fruits et les noix entre les fromages, et servez les pains à part.',
        'Comptez 80 g de fromage par personne en fin de repas, 200 g si le plateau est le plat principal.',
      ],
      tip: 'Coupez le Saint-Nectaire en parts comme un gâteau, et le Cantal en tranches fines : chacun garde ainsi sa part de croûte et de cœur.',
    },
  ],
  // Crédits des photos (auteur, licence, page source) — généré, voir assets/photos/CREDITS.md
  photoCredits: {
    "aligot": {
      "by": "*_*",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/22539273@N00/31771137746"
    },
    "croutes": {
      "by": "Popo le Chien",
      "license": "CC0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=37545028"
    },
    "fondue": {
      "by": "Pexels",
      "license": "licence Pexels",
      "url": "https://www.pexels.com/photo/7491876/"
    },
    "fondue-pain-2": {
      "by": "Pexels",
      "license": "licence Pexels",
      "url": "https://www.pexels.com/photo/12664810/"
    },
    "fr-bleu-auvergne": {
      "by": "Pymouss",
      "license": "CC BY-SA 4.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=122563040"
    },
    "fr-bleu-causses": {
      "by": "Coyau",
      "license": "CC BY-SA 3.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=43371584"
    },
    "fr-brie-meaux": {
      "by": "inra.dist",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/135897188@N04/25671794096"
    },
    "fr-cantal-entre-deux": {
      "by": "julienfour",
      "license": "CC0",
      "url": "https://www.flickr.com/photos/156217834@N02/26280943128"
    },
    "fr-cantal-jeune": {
      "by": "Silverman68",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/29120766@N07/5422853344"
    },
    "fr-cantal-vieux": {
      "by": "DEWEGGIS",
      "license": "CC BY-ND 2.0",
      "url": "https://www.flickr.com/photos/72332627@N05/15083598221"
    },
    "fr-chevre": {
      "by": "Sunfox",
      "license": "CC BY-SA 2.0",
      "url": "https://www.flickr.com/photos/24816568@N00/4617951807"
    },
    "fr-comte": {
      "by": "leszed.com",
      "license": "CC BY-SA 2.0",
      "url": "https://www.flickr.com/photos/131857276@N03/16768910266"
    },
    "fr-fourme-ambert": {
      "by": "avlxyz",
      "license": "CC BY-SA 2.0",
      "url": "https://www.flickr.com/photos/10559879@N00/544000085"
    },
    "fr-gaperon": {
      "by": "Pierre-Yves Beaudouin",
      "license": "CC BY-SA 4.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=45473099"
    },
    "fr-laguiole": {
      "by": "Coyau",
      "license": "CC BY-SA 3.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=38084570"
    },
    "fr-reblochon": {
      "by": "srboisvert",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/35034346289@N01/5901507691"
    },
    "fr-roquefort": {
      "by": "Thesupermat",
      "license": "CC BY-SA 4.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=39709529"
    },
    "fr-saint-nectaire": {
      "by": "Homer Ectus",
      "license": "CC BY-SA 3.0",
      "url": "https://commons.wikimedia.org/w/index.php?curid=27893588"
    },
    "fr-salers": {
      "by": "inra.dist",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/135897188@N04/25605244751"
    },
    "patranque": {
      "by": "Pexels",
      "license": "licence Pexels",
      "url": "https://www.pexels.com/photo/37448233/"
    },
    "plateau-bois": {
      "by": "Pexels",
      "license": "licence Pexels",
      "url": "https://www.pexels.com/photo/2992308/"
    },
    "salade-noix": {
      "by": "jules:stonesoup",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/58367355@N00/5939037091"
    },
    "tarte-poire": {
      "by": "bloggyboulga",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/88183497@N00/395216980"
    },
    "truffade": {
      "by": "*_*",
      "license": "CC BY 2.0",
      "url": "https://www.flickr.com/photos/22539273@N00/32304267042"
    },
    "vache-salers": {
      "by": "Pexels",
      "license": "licence Pexels",
      "url": "https://www.pexels.com/photo/18978636/"
    }
  },
};
