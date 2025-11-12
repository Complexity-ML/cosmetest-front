// formConfig.ts - Configuration des sections du formulaire

// Type definitions
export interface FormItem {
  id: string;
  label: string;
}

export interface FormGroup {
  title?: string;
  items: FormItem[];
}

export interface FormSection {
  title: string;
  icon: string;
  groups: FormGroup[];
}

/**
 * Configuration des sections du formulaire des habitudes cosmétiques
 */
export const FORM_SECTIONS: FormSection[] = [
  {
    title: 'Habitudes d\'achat',
    icon: 'shopping-bag',
    groups: [
      {
        title: 'Lieux d\'achat',
        items: [
          { id: 'achatPharmacieParapharmacie', label: 'Pharmacie/Parapharmacie' },
          { id: 'achatGrandesSurfaces', label: 'Grandes surfaces' },
          { id: 'achatInstitutParfumerie', label: 'Institut/Parfumerie' },
          { id: 'achatInternet', label: 'Internet' }
        ]
      },
      {
        title: 'Produits bio',
        items: [
          { id: 'produitsBio', label: 'Utilisation de produits bio' }
        ]
      }
    ]
  },
  {
    title: 'Épilation',
    icon: 'scissors',
    groups: [
      {
        title: 'Méthodes utilisées',
        items: [
          { id: 'rasoir', label: 'Rasoir' },
          { id: 'epilateurElectrique', label: 'Épilateur électrique' },
          { id: 'cire', label: 'Cire' },
          { id: 'cremeDepilatoire', label: 'Crème dépilatoire' }
        ]
      },
      {
        title: 'Méthodes professionnelles',
        items: [
          { id: 'institut', label: 'Institut' },
          { id: 'epilationDefinitive', label: 'Épilation définitive' }
        ]
      }
    ]
  },
  {
    title: 'Soins du visage',
    icon: 'droplet',
    groups: [
      {
        title: 'Soins de base',
        items: [
          { id: 'soinHydratantVisage', label: 'Hydratant' },
          { id: 'soinNourissantVisage', label: 'Nourrissant' },
          { id: 'soinMatifiantVisage', label: 'Matifiant' }
        ]
      },
      {
        title: 'Soins spécifiques',
        items: [
          { id: 'soinAntiAgeVisage', label: 'Anti-âge' },
          { id: 'soinAntiRidesVisage', label: 'Anti-rides' },
          { id: 'soinAntiTachesVisage', label: 'Anti-taches' },
          { id: 'soinAntiRougeursVisage', label: 'Anti-rougeurs' },
          { id: 'soinEclatDuTeint', label: 'Éclat du teint' },
          { id: 'soinRaffermissantVisage', label: 'Raffermissant' },
          { id: 'gommageVisage', label: 'Gommage' },
          { id: 'masqueVisage', label: 'Masque' }
        ]
      },
      {
        title: 'Zones spécifiques',
        items: [
          { id: 'soinContourDesYeux', label: 'Contour des yeux' },
          { id: 'soinContourDesLevres', label: 'Contour des lèvres' },
        ]
      }
    ]
  },
  {
    title: 'Démaquillage et nettoyage',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'demaquillantVisage', label: 'Démaquillant visage' },
          { id: 'demaquillantYeux', label: 'Démaquillant yeux' },
          { id: 'demaquillantWaterproof', label: 'Démaquillant waterproof' },
          { id: 'gelNettoyant', label: 'Gel nettoyant' },
          { id: 'lotionMicellaire', label: 'Lotion micellaire' },
          { id: 'tonique', label: 'Tonique' }
        ]
      }
    ]
  },
  {
    title: 'Soins du corps',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'soinHydratantCorps', label: 'Hydratant corps' },
          { id: 'soinNourrissantCorps', label: 'Nourrissant corps' },
          { id: 'soinRaffermissantCorps', label: 'Raffermissant corps' },
          { id: 'soinAmincissant', label: 'Amincissant' },
          { id: 'soinAntiCellulite', label: 'Anti-cellulite' },
          { id: 'soinAntiVergetures', label: 'Anti-vergetures' },
          { id: 'soinAntiAgeCorps', label: 'Anti-âge corps' },
          { id: 'gommageCorps', label: 'Gommage corps' },
          { id: 'masqueCorps', label: 'Masque corps' }
        ]
      }
    ]
  },
  {
    title: 'Soins spécifiques',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'soinHydratantMains', label: 'Hydratant mains' },
          { id: 'soinNourrissantMains', label: 'Nourrissant mains' },
          { id: 'soinAntiAgeMains', label: 'Anti-âge mains' },
          { id: 'soinAntiTachesMains', label: 'Anti-taches mains' },
          { id: 'soinPieds', label: 'Soin pieds' },
          { id: 'soinOngles', label: 'Soin ongles' }
        ]
      }
    ]
  },
  {
    title: 'Produits d\'hygiène',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'gelDouche', label: 'Gel douche' },
          { id: 'laitDouche', label: 'Lait douche' },
          { id: 'savon', label: 'Savon' },
          { id: 'produitsBain', label: 'Produits bain' },
          { id: 'nettoyantIntime', label: 'Nettoyant intime' },
          { id: 'deodorant', label: 'Déodorant' },
          { id: 'antiTranspirant', label: 'Anti-transpirant' }
        ]
      }
    ]
  },
  {
    title: 'Soins capillaires',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'shampoing', label: 'Shampooing' },
          { id: 'apresShampoing', label: 'Après-shampooing' },
          { id: 'masqueCapillaire', label: 'Masque capillaire' },
          { id: 'produitCoiffantFixant', label: 'Produit coiffant' },
          { id: 'colorationMeches', label: 'Coloration/mèches' },
          { id: 'permanente', label: 'Permanente' },
          { id: 'lissageDefrisage', label: 'Lissage/défrisage' },
          { id: 'extensionsCapillaires', label: 'Extensions capillaires' }
        ]
      }
    ]
  },
  {
    title: 'Maquillage visage',
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'fondDeTeint', label: 'Fond de teint' },
          { id: 'poudreLibre', label: 'Poudre libre' },
          { id: 'blushFardAJoues', label: 'Blush/fard à joues' },
          { id: 'correcteurTeint', label: 'Correcteur teint' },
          { id: 'anticerne', label: 'Anticerne' },
          { id: 'baseMaquillage', label: 'Base maquillage' },
          { id: 'cremeTeintee', label: 'Crème teintée' }
        ]
      }
    ]
  },
  {
    title: 'Maquillage yeux',
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'mascara', label: 'Mascara' },
          { id: 'mascaraWaterproof', label: 'Mascara waterproof' },
          { id: 'crayonsYeux', label: 'Crayons yeux' },
          { id: 'eyeliner', label: 'Eyeliner' },
          { id: 'fardAPaupieres', label: 'Fard à paupières' },
          { id: 'maquillageDesSourcils', label: 'Maquillage sourcils' },
          { id: 'fauxCils', label: 'Faux cils' }
        ]
      }
    ]
  },
  {
    title: 'Maquillage lèvres et ongles',
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'rougeALevres', label: 'Rouge à lèvres' },
          { id: 'gloss', label: 'Gloss' },
          { id: 'crayonLevres', label: 'Crayon lèvres' },
          { id: 'vernisAOngles', label: 'Vernis à ongles' },
          { id: 'dissolvantOngles', label: 'Dissolvant' },
          { id: 'fauxOngles', label: 'Faux ongles' },
          { id: 'manucures', label: 'Manucures' }
        ]
      }
    ]
  },
  {
    title: 'Maquillage permanent',
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'maquillagePermanentYeux', label: 'Yeux' },
          { id: 'maquillagePermanentLevres', label: 'Lèvres' },
          { id: 'maquillagePermanentSourcils', label: 'Sourcils' }
        ]
      }
    ]
  },
  {
    title: 'Solaire',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'protecteurSolaireVisage', label: 'Protecteur visage' },
          { id: 'protecteurSolaireCorps', label: 'Protecteur corps' },
          { id: 'protecteurSolaireLevres', label: 'Protecteur lèvres' },
          { id: 'soinApresSoleil', label: 'Soin après-soleil' },
          { id: 'autobronzant', label: 'Autobronzant' }
        ]
      }
    ]
  },
  {
    title: 'Parfums',
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'parfum', label: 'Parfum' },
          { id: 'eauDeToilette', label: 'Eau de toilette' }
        ]
      }
    ]
  },
  {
    title: 'Produits pour hommes',
    icon: 'user',
    groups: [
      {
        items: [
          { id: 'apresRasage', label: 'Après-rasage' },
          { id: 'gelARaser', label: 'Gel à raser' },
          { id: 'mousseARaser', label: 'Mousse à raser' },
          { id: 'tondeuseBarbe', label: 'Tondeuse barbe' },
          { id: 'ombreBarbe', label: 'Ombre barbe' },
          { id: 'rasoirElectrique', label: 'Rasoir électrique' },
          { id: 'rasoirMecanique', label: 'Rasoir mécanique' }
        ]
      }
    ]
  }
];
