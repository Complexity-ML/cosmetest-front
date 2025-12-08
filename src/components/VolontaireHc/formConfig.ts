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
 * Fonction pour obtenir les sections du formulaire avec traductions
 * @param t - Fonction de traduction de react-i18next
 */
export const getFormSections = (t: (key: string) => string): FormSection[] => [
  {
    title: t('habitsCosmetiques.shoppingHabits'),
    icon: 'shopping-bag',
    groups: [
      {
        title: t('habitsCosmetiques.purchaseLocations'),
        items: [
          { id: 'achatPharmacieParapharmacie', label: t('habitsCosmetiques.pharmacyParapharmacy') },
          { id: 'achatGrandesSurfaces', label: t('habitsCosmetiques.supermarkets') },
          { id: 'achatInstitutParfumerie', label: t('habitsCosmetiques.institutePerfumery') },
          { id: 'achatInternet', label: t('habitsCosmetiques.internet') }
        ]
      },
      {
        title: t('habitsCosmetiques.organicProducts'),
        items: [
          { id: 'produitsBio', label: t('habitsCosmetiques.useOrganicProducts') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.hairRemoval'),
    icon: 'scissors',
    groups: [
      {
        title: t('habitsCosmetiques.methodsUsed'),
        items: [
          { id: 'rasoir', label: t('habitsCosmetiques.razor') },
          { id: 'epilateurElectrique', label: t('habitsCosmetiques.electricEpilator') },
          { id: 'cire', label: t('habitsCosmetiques.wax') },
          { id: 'cremeDepilatoire', label: t('habitsCosmetiques.depilatoryCream') }
        ]
      },
      {
        title: t('habitsCosmetiques.professionalMethods'),
        items: [
          { id: 'institut', label: t('habitsCosmetiques.institute') },
          { id: 'epilationDefinitive', label: t('habitsCosmetiques.permanentHairRemoval') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.facialCare'),
    icon: 'droplet',
    groups: [
      {
        title: t('habitsCosmetiques.basicCare'),
        items: [
          { id: 'soinHydratantVisage', label: t('habitsCosmetiques.moisturizing') },
          { id: 'soinNourissantVisage', label: t('habitsCosmetiques.nourishing') },
          { id: 'soinMatifiantVisage', label: t('habitsCosmetiques.mattifying') }
        ]
      },
      {
        title: t('habitsCosmetiques.specificCare'),
        items: [
          { id: 'soinAntiAgeVisage', label: t('habitsCosmetiques.antiAging') },
          { id: 'soinAntiRidesVisage', label: t('habitsCosmetiques.antiWrinkle') },
          { id: 'soinAntiTachesVisage', label: t('habitsCosmetiques.antiSpot') },
          { id: 'soinAntiRougeursVisage', label: t('habitsCosmetiques.antiRedness') },
          { id: 'soinEclatDuTeint', label: t('habitsCosmetiques.radiance') },
          { id: 'soinRaffermissantVisage', label: t('habitsCosmetiques.firming') },
          { id: 'gommageVisage', label: t('habitsCosmetiques.exfoliatingFace') },
          { id: 'masqueVisage', label: t('habitsCosmetiques.faceMask') }
        ]
      },
      {
        title: t('habitsCosmetiques.specificAreas'),
        items: [
          { id: 'soinContourDesYeux', label: t('habitsCosmetiques.eyeContour') },
          { id: 'soinContourDesLevres', label: t('habitsCosmetiques.lipContour') },
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.makeupRemovalCleansing'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'demaquillantVisage', label: t('habitsCosmetiques.faceMakeupRemover') },
          { id: 'demaquillantYeux', label: t('habitsCosmetiques.eyeMakeupRemover') },
          { id: 'demaquillantWaterproof', label: t('habitsCosmetiques.waterproofMakeupRemover') },
          { id: 'gelNettoyant', label: t('habitsCosmetiques.cleansingGel') },
          { id: 'lotionMicellaire', label: t('habitsCosmetiques.micellarWater') },
          { id: 'tonique', label: t('habitsCosmetiques.toner') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.bodyCare'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'soinHydratantCorps', label: t('habitsCosmetiques.moisturizingBody') },
          { id: 'soinNourrissantCorps', label: t('habitsCosmetiques.nourishingBody') },
          { id: 'soinRaffermissantCorps', label: t('habitsCosmetiques.firmingBody') },
          { id: 'soinAmincissant', label: t('habitsCosmetiques.slimming') },
          { id: 'soinAntiCellulite', label: t('habitsCosmetiques.antiCellulite') },
          { id: 'soinAntiVergetures', label: t('habitsCosmetiques.antiStretchMarks') },
          { id: 'soinAntiAgeCorps', label: t('habitsCosmetiques.antiAgingBody') },
          { id: 'gommageCorps', label: t('habitsCosmetiques.bodyExfoliating') },
          { id: 'masqueCorps', label: t('habitsCosmetiques.bodyMask') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.specificBodyParts'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'soinHydratantMains', label: t('habitsCosmetiques.handMoisturizer') },
          { id: 'soinNourrissantMains', label: t('habitsCosmetiques.handNourishing') },
          { id: 'soinAntiAgeMains', label: t('habitsCosmetiques.handAntiAging') },
          { id: 'soinAntiTachesMains', label: t('habitsCosmetiques.handAntiSpot') },
          { id: 'soinPieds', label: t('habitsCosmetiques.footCare') },
          { id: 'soinOngles', label: t('habitsCosmetiques.nailCare') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.hygieneProducts'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'gelDouche', label: t('habitsCosmetiques.showerGel') },
          { id: 'laitDouche', label: t('habitsCosmetiques.showerMilk') },
          { id: 'savon', label: t('habitsCosmetiques.soap') },
          { id: 'produitsBain', label: t('habitsCosmetiques.bathProducts') },
          { id: 'nettoyantIntime', label: t('habitsCosmetiques.intimateCleanser') },
          { id: 'deodorant', label: t('habitsCosmetiques.deodorant') },
          { id: 'antiTranspirant', label: t('habitsCosmetiques.antiperspirant') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.hairCare'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'shampoing', label: t('habitsCosmetiques.shampoo') },
          { id: 'apresShampoing', label: t('habitsCosmetiques.conditioner') },
          { id: 'masqueCapillaire', label: t('habitsCosmetiques.hairMask') },
          { id: 'produitCoiffantFixant', label: t('habitsCosmetiques.stylingProduct') },
          { id: 'colorationMeches', label: t('habitsCosmetiques.coloringHighlights') },
          { id: 'permanente', label: t('habitsCosmetiques.perm') },
          { id: 'lissageDefrisage', label: t('habitsCosmetiques.straighteningRelaxing') },
          { id: 'extensionsCapillaires', label: t('habitsCosmetiques.hairExtensions') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.faceMakeup'),
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'fondDeTeint', label: t('habitsCosmetiques.foundation') },
          { id: 'poudreLibre', label: t('habitsCosmetiques.loosePowder') },
          { id: 'blushFardAJoues', label: t('habitsCosmetiques.blush') },
          { id: 'correcteurTeint', label: t('habitsCosmetiques.concealer') },
          { id: 'anticerne', label: t('habitsCosmetiques.underEyeConcealer') },
          { id: 'baseMaquillage', label: t('habitsCosmetiques.primer') },
          { id: 'cremeTeintee', label: t('habitsCosmetiques.tintedCream') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.eyeMakeup'),
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'mascara', label: t('habitsCosmetiques.mascara') },
          { id: 'mascaraWaterproof', label: t('habitsCosmetiques.waterproofMascara') },
          { id: 'crayonsYeux', label: t('habitsCosmetiques.eyePencils') },
          { id: 'eyeliner', label: t('habitsCosmetiques.eyeliner') },
          { id: 'fardAPaupieres', label: t('habitsCosmetiques.eyeshadow') },
          { id: 'maquillageDesSourcils', label: t('habitsCosmetiques.eyebrowMakeup') },
          { id: 'fauxCils', label: t('habitsCosmetiques.falseLashes') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.lipsNailsMakeup'),
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'rougeALevres', label: t('habitsCosmetiques.lipstick') },
          { id: 'gloss', label: t('habitsCosmetiques.lipGloss') },
          { id: 'crayonLevres', label: t('habitsCosmetiques.lipLiner') },
          { id: 'vernisAOngles', label: t('habitsCosmetiques.nailPolish') },
          { id: 'dissolvantOngles', label: t('habitsCosmetiques.nailPolishRemover') },
          { id: 'fauxOngles', label: t('habitsCosmetiques.falseNails') },
          { id: 'manucures', label: t('habitsCosmetiques.manicures') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.permanentMakeup'),
    icon: 'brush',
    groups: [
      {
        items: [
          { id: 'maquillagePermanentYeux', label: t('habitsCosmetiques.permanentEyes') },
          { id: 'maquillagePermanentLevres', label: t('habitsCosmetiques.permanentLips') },
          { id: 'maquillagePermanentSourcils', label: t('habitsCosmetiques.permanentEyebrows') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.sunCare'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'protecteurSolaireVisage', label: t('habitsCosmetiques.faceSunscreen') },
          { id: 'protecteurSolaireCorps', label: t('habitsCosmetiques.bodySunscreen') },
          { id: 'protecteurSolaireLevres', label: t('habitsCosmetiques.lipSunscreen') },
          { id: 'soinApresSoleil', label: t('habitsCosmetiques.afterSun') },
          { id: 'autobronzant', label: t('habitsCosmetiques.selfTanner') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.fragrances'),
    icon: 'droplet',
    groups: [
      {
        items: [
          { id: 'parfum', label: t('habitsCosmetiques.perfume') },
          { id: 'eauDeToilette', label: t('habitsCosmetiques.eauDeToilette') }
        ]
      }
    ]
  },
  {
    title: t('habitsCosmetiques.mensProducts'),
    icon: 'user',
    groups: [
      {
        items: [
          { id: 'apresRasage', label: t('habitsCosmetiques.aftershave') },
          { id: 'gelARaser', label: t('habitsCosmetiques.shavingGel') },
          { id: 'mousseARaser', label: t('habitsCosmetiques.shavingFoam') },
          { id: 'tondeuseBarbe', label: t('habitsCosmetiques.beardTrimmer') },
          { id: 'ombreBarbe', label: t('habitsCosmetiques.beardShading') },
          { id: 'rasoirElectrique', label: t('habitsCosmetiques.electricShaver') },
          { id: 'rasoirMecanique', label: t('habitsCosmetiques.mechanicalRazor') }
        ]
      }
    ]
  }
];

// Export pour la compatibilité avec l'ancien code
export const FORM_SECTIONS = getFormSections((key: string) => key);
