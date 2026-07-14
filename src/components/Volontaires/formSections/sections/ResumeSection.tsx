import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { useCallback, KeyboardEvent, MutableRefObject, useRef } from "react";
import infoBancaireService from "../../../../services/infoBancaireService";

type FieldType = "text" | "boolean" | "number" | "date" | "textarea" | "preset" | "multipreset" | "subtitle";

interface FieldDef {
  key: string;
  type: FieldType;
  options?: readonly string[];
  maxSelections?: number;
}

interface GroupDef {
  titleKey: string;
  fields: FieldDef[];
}

// Options prédéfinies (synchronisées avec celles du hook useVolontaireForm)
const OPT = {
  titre: ["Madame", "Monsieur", "Autre"],
  sexe: ["Masculin", "Féminin", "Autre"],
  phototype: [
    "Phototype 1",
    "Phototype 2",
    "Phototype 3",
    "Phototype 4",
    "Phototype 5",
    "Phototype 6",
  ],
  ethnie: [
    "Caucasienne",
    "Africaine",
    "Antillaise",
    "Indienne",
    "Asiatique",
  ],
  sousEthnie: [
    "EUROP_OUEST",
    "EUROP_EST",
    "MEDITERRANEEN/MAGHREBIN",
    "NORD_AMERICAIN_CAUCASIEN",
    "SUD_AMERICAIN_CAUCASIEN",
    "AF_SUBSAHARIEN",
    "AF_OUEST",
    "AF_EST",
    "AF_CENTRALE",
    "AF_NORD",
    "AFRO_CARABEEN",
    "ANTILLAIS_METISSE",
    "CARIBEENNE",
    "AFRO_DESCENDANT_CARAIBES",
    "IND_NORD",
    "IND_SUD",
    "INDO_ARYENNE",
    "DRAVIDIENNE",
    "INDO_PAKISTANAISE",
    "AS_EST",
    "AS_SUD_EST",
    "AS_SUD",
    "AS_CENTRALE",
  ],
  yeux: ["Bleus", "Verts", "Marrons", "Noisette", "Gris", "Noirs"],
  pilosite: ["Faible pilosité", "Pilosité moyenne", "Forte pilosité"],
  typePeauVisage: [
    "Normale",
    "Sèche",
    "Grasse",
    "Mixte",
    "Mixte à tendance grasse",
    "Mixte à tendance sèche",
  ],
  carnation: [
    "Très claire",
    "Claire",
    "Moyenne",
    "Mate",
    "Foncée",
    "Très foncée",
  ],
  sensibiliteCutanee: [
    "Peau sensible",
    "Peau non sensible",
  ],
  expositionSolaire: ["Faiblement", "Moyennement", "Fortement"],
  bronzage: ["Progressif", "Rapide", "Difficile", "Inexistant"],
  coupsDeSoleil: ["Jamais", "Rarement", "Parfois", "Souvent", "Toujours"],
  couleurCheveux: [
    "Blond",
    "Châtain",
    "Brun",
    "Noir",
    "Roux",
    "Gris",
    "Blanc",
    "Colorés",
  ],
  natureCheveux: ["Lisse", "Ondulé", "Bouclé", "Crêpu", "Frisé"],
  epaisseurCheveux: ["Fins", "Moyens", "Épais"],
  natureCuirChevelu: ["Normal", "Gras", "Sec", "Mixte"],
  epaisseurCils: ["Fins", "Moyens", "Épais"],
  longueurCils: ["Courts", "Moyens", "Longs"],
  problemesCapillaires: [
    "Aucun",
    "Cuir chevelu sensible",
    "Chute de cheveux",
    "Cheveux cassants",
  ],
  courbureCils: ["Droit", "Courbé"],
  problemesCils: ["Cils abîmés", "Cils broussailleux", "Chute de cils"],
  caracteristiqueSourcils: ["Clairsemés", "Fournis"],
  levres: ["Fines", "Moyennes", "Pulpeuses", "Asymétriques"],
  perteDeFermete: [
    "Aucune",
    "Visage",
    "Cou",
    "Décolleté / Poitrine",
    "Avant-bras",
  ],
  secheressePeau: [
    "Aucune",
    "Lèvres",
    "Cou",
    "Poitrine / Décolleté",
    "Ventre / Taille",
    "Fesses / Hanches",
    "Bras",
    "Mains",
    "Avant-bras",
  ],
  contraception: ["Préservatif", "Pilule", "Implant", "Patch", "Anneau vaginal", "Stérilet", "Abstinence", "Aucun", "Autre"],
} as const;

const GROUPS: GroupDef[] = [
    {
    titleKey: "evaluation",
    fields: [
      { key: "evaluation", type: "number" },
      { key: "tenueLevres", type: "boolean" },
      { key: "tenueTeint", type: "boolean" },
      { key: "tenueBlush", type: "boolean" },
      { key: "tenueSourcil", type: "boolean" },
      { key: "tenueLiner", type: "boolean" },
      { key: "demaquillant", type: "boolean" },
      { key: "etudeCils", type: "boolean" },
      { key: "corneoLevre", type: "boolean" },
      { key: "corneoBras", type: "boolean" },
      { key: "dtm", type: "boolean" },
    ],
  },
  {
    titleKey: "personalInformation",
    fields: [
      { key: "titre", type: "preset", options: OPT.titre },
      { key: "nom", type: "text" },
      { key: "prenom", type: "text" },
      { key: "email", type: "text" },
      { key: "telephone", type: "text" },
      { key: "telephoneDomicile", type: "text" },
      { key: "sexe", type: "preset", options: OPT.sexe },
      { key: "dateNaissance", type: "date" },
      { key: "adresse", type: "text" },
      { key: "codePostal", type: "text" },
      { key: "ville", type: "text" },
      { key: "pays", type: "text" },
    ],
  },
  {
    titleKey: "physicalCharacteristics",
    fields: [
      { key: "taille", type: "number" },
      { key: "poids", type: "number" },
      { key: "phototype", type: "preset", options: OPT.phototype },
      { key: "ethnie", type: "multipreset", options: OPT.ethnie, maxSelections: 2 },
      { key: "sousEthnie", type: "multipreset", options: OPT.sousEthnie, maxSelections: 2 },
      { key: "yeux", type: "preset", options: OPT.yeux },
      { key: "pilosite", type: "preset", options: OPT.pilosite },
      { key: "originePere", type: "preset", options: OPT.ethnie },
      { key: "origineMere", type: "preset", options: OPT.ethnie },
      { key: "cicatrices", type: "text" },
      { key: "tatouages", type: "text" },
      { key: "piercings", type: "text" },
      { key: "maquillagePermanent", type: "text" },
    ],
  },
  {
    titleKey: "skin",
    fields: [
      { key: "sensibiliteCutanee", type: "preset", options: OPT.sensibiliteCutanee },
      { key: "carnation", type: "preset", options: OPT.carnation },
      { key: "typePeauVisage", type: "preset", options: OPT.typePeauVisage },
      { key: "teintInhomogene", type: "boolean" },
      { key: "teintTerne", type: "boolean" },
      { key: "poresVisibles", type: "boolean" },
      { key: "expositionSolaire", type: "preset", options: OPT.expositionSolaire },
      { key: "bronzage", type: "preset", options: OPT.bronzage },
      { key: "coupsDeSoleil", type: "preset", options: OPT.coupsDeSoleil },
      { key: "subtitle_cellulite", type: "subtitle" },
      { key: "celluliteBras", type: "boolean" },
      { key: "celluliteFessesHanches", type: "boolean" },
      { key: "celluliteJambes", type: "boolean" },
      { key: "celluliteVentreTaille", type: "boolean" },
      { key: "subtitle_secheressePeau", type: "subtitle" },
      { key: "secheresseLevres", type: "boolean" },
      { key: "secheresseCou", type: "boolean" },
      { key: "secheressePoitrineDecollete", type: "boolean" },
      { key: "secheresseVentreTaille", type: "boolean" },
      { key: "secheresseFessesHanches", type: "boolean" },
      { key: "secheresseBras", type: "boolean" },
      { key: "secheresseMains", type: "boolean" },
      { key: "secheresseJambes", type: "boolean" },
      { key: "secheressePieds", type: "boolean" },
      { key: "subtitle_problemesYeux", type: "subtitle" },
      { key: "cernesPigmentaires", type: "boolean" },
      { key: "cernesVasculaires", type: "boolean" },
      { key: "poches", type: "boolean" },
      { key: "subtitle_perteDeFermete", type: "subtitle" },
      { key: "perteDeFermeteVisage", type: "boolean" },
      { key: "perteDeFermeteCou", type: "boolean" },
      { key: "perteDeFermeteDecollete", type: "boolean" },
      { key: "perteDeFermeteAvantBras", type: "boolean" },
    ],
  },
  {
    titleKey: "skinMarks",
    fields: [
      { key: "vergeturesJambes", type: "boolean" },
      { key: "vergeturesFessesHanches", type: "boolean" },
      { key: "vergeturesVentreTaille", type: "boolean" },
      { key: "vergeturesPoitrineDecollete", type: "boolean" },
      { key: "tachesPigmentairesVisage", type: "boolean" },
      { key: "tachesPigmentairesCou", type: "boolean" },
      { key: "tachesPigmentairesDecollete", type: "boolean" },
      { key: "tachesPigmentairesMains", type: "boolean" },
    ],
  },
  {
    titleKey: "hairAndNails",
    fields: [
      { key: "couleurCheveux", type: "preset", options: OPT.couleurCheveux },
      { key: "natureCheveux", type: "preset", options: OPT.natureCheveux },
      { key: "epaisseurCheveux", type: "preset", options: OPT.epaisseurCheveux },
      { key: "natureCuirChevelu", type: "preset", options: OPT.natureCuirChevelu },
      { key: "cuirCheveluSensible", type: "boolean" },
      { key: "chuteDeCheveux", type: "boolean" },
      { key: "cheveuxCassants", type: "boolean" },
      { key: "calvitie", type: "boolean" },
      { key: "pellicules", type: "boolean" },
      { key: "demangeaisonsCuirChevelu", type: "boolean" },
      { key: "onglesCassants", type: "boolean" },
      { key: "onglesDedoubles", type: "boolean" },
    ],
  },
  {
    titleKey: "eyelashesAndEyebrows",
    fields: [
      { key: "epaisseurCils", type: "preset", options: OPT.epaisseurCils },
      { key: "longueurCils", type: "preset", options: OPT.longueurCils },
      { key: "courbureCils", type: "preset", options: OPT.courbureCils },
      { key: "cilsAbimes", type: "boolean" },
      { key: "cilsBroussailleux", type: "boolean" },
      { key: "chuteDeCils", type: "boolean" },
      { key: "caracteristiqueSourcils", type: "preset", options: OPT.caracteristiqueSourcils },
      { key: "levres", type: "preset", options: OPT.levres },
    ],
  },
  {
    titleKey: "specificProblems",
    fields: [
      { key: "acne", type: "boolean" },
      { key: "couperoseRosacee", type: "boolean" },
      { key: "dermiteSeborrheique", type: "boolean" },
      { key: "eczema", type: "boolean" },
      { key: "psoriasis", type: "boolean" },
    ],
  },
  {
    titleKey: "medicalInformation",
    fields: [
      { key: "traitement", type: "textarea" },
      { key: "anamnese", type: "textarea" },
      { key: "contraception", type: "preset", options: OPT.contraception },
      { key: "menopause", type: "boolean" },
      { key: "bouffeeChaleurMenaupose", type: "boolean" },
      { key: "allergiesCommentaires", type: "textarea" },
      { key: "santeCompatible", type: "boolean" },
    ],
  },
  {
    titleKey: "medecineEsthetique",
    fields: [
      { key: "injectionsVisage", type: "boolean" },
      { key: "injectionsVisageZone", type: "text" },
      { key: "injectionsVisageDate", type: "date" },
      { key: "maquillagePermanentVisage", type: "boolean" },
      { key: "maquillagePermanentVisageZone", type: "text" },
      { key: "maquillagePermanentVisageDate", type: "date" },
    ],
  },
  {
    titleKey: "notes",
    fields: [
      { key: "notes", type: "textarea" },
      { key: "observations", type: "textarea" },
    ],
  },
  {
    titleKey: "bankDetails",
    fields: [
      { key: "iban", type: "text" },
      { key: "bic", type: "text" },
    ],
  },
];

const createSyntheticEvent = (name: string, value: any, type: string = "text") =>
  ({ target: { name, value, type } } as any);

const stripAccents = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const parseCsv = (value: string) =>
  value
    ? value.split(",").map((item) => item.trim()).filter(Boolean)
    : [];

const TYPEAHEAD_TIMEOUT_MS = 900;

const getTypeaheadQuery = (
  ref: MutableRefObject<{ query: string; lastAt: number }>,
  key: string,
) => {
  const now = Date.now();
  const letter = stripAccents(key).toLowerCase();
  const shouldReset =
    now - ref.current.lastAt > TYPEAHEAD_TIMEOUT_MS ||
    ref.current.query.length >= 2;
  const query =
    shouldReset || ref.current.query === letter
      ? letter
      : `${ref.current.query}${letter}`;

  ref.current = { query, lastAt: now };
  return query;
};

// ---------- Boolean Yes/No input ----------
interface BooleanYesNoInputProps {
  name: string;
  value: string;
  onChange: (e: any) => void;
  placeholder: string;
  title: string;
}

const BooleanYesNoInput = ({
  name,
  value,
  onChange,
  placeholder,
  title,
}: BooleanYesNoInputProps) => {
  const { t } = useTranslation();
  const display =
    value === "Oui"
      ? t("common.yes", "Oui")
      : value === "Non"
        ? t("common.no", "Non")
        : "";

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const k = e.key.toLowerCase();
      if (k === "o" || k === "y") {
        e.preventDefault();
        onChange(createSyntheticEvent(name, "Oui"));
      } else if (k === "n") {
        e.preventDefault();
        onChange(createSyntheticEvent(name, "Non"));
      } else if (k === "backspace" || k === "delete") {
        e.preventDefault();
        onChange(createSyntheticEvent(name, ""));
      } else if (
        k === "tab" ||
        k === "enter" ||
        k === "arrowright" ||
        k === "arrowleft" ||
        k === "arrowup" ||
        k === "arrowdown" ||
        k === "shift"
      ) {
        // allow default
      } else {
        e.preventDefault();
      }
    },
    [name, onChange],
  );

  const colorClass =
    value === "Oui"
      ? "bg-green-50 border-green-400 text-green-700"
      : value === "Non"
        ? "bg-red-50 border-red-400 text-red-700"
        : "bg-white border-gray-300 text-gray-500";

  return (
    <input
      type="text"
      name={name}
      value={display}
      readOnly
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      title={title}
      className={`w-24 text-center font-semibold border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 ${colorClass}`}
    />
  );
};

// ---------- Preset (choix prédéfinis) input ----------
interface PresetInputProps {
  name: string;
  value: string;
  options: readonly string[];
  onChange: (e: any) => void;
  title: string;
}

const PresetInput = ({ name, value, options, onChange, title }: PresetInputProps) => {
  const typeaheadRef = useRef({ query: "", lastAt: 0 });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const k = e.key;

      if (k === "Backspace" || k === "Delete") {
        e.preventDefault();
        onChange(createSyntheticEvent(name, ""));
        return;
      }

      if (k === "ArrowDown" || k === "ArrowRight") {
        e.preventDefault();
        const idx = options.indexOf(value);
        const next = idx === -1 ? 0 : (idx + 1) % options.length;
        onChange(createSyntheticEvent(name, options[next]));
        return;
      }

      if (k === "ArrowUp" || k === "ArrowLeft") {
        e.preventDefault();
        const idx = options.indexOf(value);
        const prev = idx <= 0 ? options.length - 1 : idx - 1;
        onChange(createSyntheticEvent(name, options[prev]));
        return;
      }

      if (k === "Tab" || k === "Enter" || k === "Shift") return;

      // Matching par première lettre (insensible aux accents/casse)
      if (k.length === 1 && /[a-zA-ZÀ-ÿ]/.test(k)) {
        e.preventDefault();
        const query = getTypeaheadQuery(typeaheadRef, k);
        const matches = options.filter(
          (o) => stripAccents(o).toLowerCase().startsWith(query),
        );
        if (matches.length === 0) {
          const letter = query.charAt(query.length - 1);
          const letterMatches = options.filter(
            (o) => stripAccents(o).toLowerCase().startsWith(letter),
          );
          if (letterMatches.length === 0) return;
          onChange(createSyntheticEvent(name, letterMatches[0]));
          return;
        }
        if (query.length > 1) {
          onChange(createSyntheticEvent(name, matches[0]));
          return;
        }
        // Si la valeur actuelle est dans les matches, passe à la suivante (cycle)
        const curIdx = matches.indexOf(value);
        const next =
          curIdx === -1 ? matches[0] : matches[(curIdx + 1) % matches.length];
        onChange(createSyntheticEvent(name, next));
        return;
      }

      e.preventDefault();
    },
    [name, value, options, onChange],
  );

  return (
    <input
      type="text"
      name={name}
      value={value || ""}
      readOnly
      onKeyDown={handleKeyDown}
      placeholder="—"
      title={title}
      className={`w-full text-center border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        value
          ? "bg-blue-50 border-blue-300 text-blue-800 font-medium"
          : "bg-white border-gray-300 text-gray-500"
      }`}
    />
  );
};

interface SlotPresetButtonProps {
  name: string;
  value: string;
  options: readonly string[];
  onSelect: (value: string) => void;
  placeholder: string;
  title: string;
}

const SlotPresetButton = ({
  name,
  value,
  options,
  onSelect,
  placeholder,
  title,
}: SlotPresetButtonProps) => {
  const typeaheadRef = useRef({ query: "", lastAt: 0 });

  const chooseNext = (candidates: readonly string[], direction: 1 | -1 = 1) => {
    if (candidates.length === 0) return;

    const currentIndex = value ? candidates.indexOf(value) : -1;
    const nextIndex =
      direction === 1
        ? currentIndex === -1
          ? 0
          : (currentIndex + 1) % candidates.length
        : currentIndex <= 0
          ? candidates.length - 1
          : currentIndex - 1;

    onSelect(candidates[nextIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    const k = e.key;

    if (k === "Backspace" || k === "Delete") {
      e.preventDefault();
      onSelect("");
      return;
    }

    if (k === "ArrowDown" || k === "ArrowRight") {
      e.preventDefault();
      chooseNext(options, 1);
      return;
    }

    if (k === "ArrowUp" || k === "ArrowLeft") {
      e.preventDefault();
      chooseNext(options, -1);
      return;
    }

    if (k === "Tab" || k === "Enter" || k === "Shift") return;

    if (k.length === 1 && /[a-zA-ZÀ-ÿ]/.test(k)) {
      e.preventDefault();
      const query = getTypeaheadQuery(typeaheadRef, k);
      const matches = options.filter((option) =>
        stripAccents(option).toLowerCase().startsWith(query),
      );

      if (matches.length > 0) {
        onSelect(matches[0]);
        return;
      }

      const fallbackLetter = query.charAt(query.length - 1);
      const fallback = options.find((option) =>
        stripAccents(option).toLowerCase().startsWith(fallbackLetter),
      );
      if (fallback) onSelect(fallback);
      return;
    }

    e.preventDefault();
  };

  return (
    <button
      type="button"
      name={name}
      onClick={() => chooseNext(options, 1)}
      onKeyDown={handleKeyDown}
      title={title}
      className={`w-full min-w-0 rounded border px-2 py-1 text-center text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 ${
        value
          ? "bg-blue-50 border-blue-300 text-blue-800 font-medium"
          : "bg-white border-gray-300 text-gray-500"
      }`}
    >
      <span className="block truncate">{value || placeholder}</span>
    </button>
  );
};

interface MultiSlotPresetInputProps {
  name: string;
  value: string;
  options: readonly string[];
  onChange: (e: any) => void;
  title: string;
  slotCount?: number;
}

const MultiSlotPresetInput = ({
  name,
  value,
  options,
  onChange,
  title,
  slotCount = 2,
}: MultiSlotPresetInputProps) => {
  const selected = parseCsv(value);
  const slots = Array.from({ length: slotCount }, (_, index) => selected[index] || "");
  const labelBase = name === "sousEthnie" ? "Sous-ethnie" : "Ethnie";

  const updateSlot = (slotIndex: number, option: string) => {
    const next = [...slots];
    next[slotIndex] = option;

    if (option) {
      next.forEach((current, index) => {
        if (index !== slotIndex && current === option) next[index] = "";
      });
    }

    onChange(createSyntheticEvent(name, next.filter(Boolean).join(",")));
  };

  return (
    <div className="grid grid-cols-2 gap-1" title={title}>
      {slots.map((slotValue, index) => (
        <SlotPresetButton
          key={`${name}-${index}`}
          name={`${name}-${index + 1}`}
          value={slotValue}
          options={options}
          onSelect={(option) => updateSlot(index, option)}
          placeholder={`${labelBase} ${index + 1}`}
          title={`${labelBase} ${index + 1} · Tapez 1-2 lettres ou utilisez ↑↓ · Backspace pour effacer`}
        />
      ))}
    </div>
  );
};

// ---------- Main section ----------
const ResumeSection = ({ formData, onChange }: any) => {
  const { t } = useTranslation();

  const yesNoPlaceholder = t("volunteers.resume.yesNoPlaceholder", "o / n");
  const yesNoTitle = t(
    "volunteers.resume.yesNoTitle",
    "Tapez 'o' pour Oui, 'n' pour Non, Tab pour passer au champ suivant",
  );
  const presetTitleTpl = t(
    "volunteers.resume.presetTitle",
    "Tapez la 1ère lettre pour sélectionner · ↑↓ pour naviguer · Backspace pour effacer · Options: {{options}}",
  );

  const renderField = (field: FieldDef) => {
    const value = formData?.[field.key] ?? "";

    if (field.type === "boolean") {
      return (
        <BooleanYesNoInput
          name={field.key}
          value={String(value)}
          onChange={onChange}
          placeholder={yesNoPlaceholder}
          title={yesNoTitle}
        />
      );
    }

    if (field.type === "preset" && field.options) {
      const title = presetTitleTpl.replace(
        "{{options}}",
        field.options.join(", "),
      );
      return (
        <PresetInput
          name={field.key}
          value={String(value)}
          options={field.options}
          onChange={onChange}
          title={title}
        />
      );
    }

    if (field.type === "multipreset" && field.options) {
      return (
        <MultiSlotPresetInput
          name={field.key}
          value={String(value)}
          options={field.options}
          onChange={onChange}
          title={field.options.join(", ")}
          slotCount={field.maxSelections}
        />
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          name={field.key}
          value={value}
          onChange={onChange}
          rows={2}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      );
    }

    if (field.type === "number") {
      return (
        <input
          type="number"
          name={field.key}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      );
    }

    if (field.type === "date") {
      return (
        <input
          type="date"
          name={field.key}
          value={value}
          onChange={onChange}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      );
    }

    if (field.key === "iban") {
      return (
        <input
          type="text"
          name={field.key}
          value={infoBancaireService.validation.formatIban(String(value))}
          onChange={(e) =>
            onChange(createSyntheticEvent(field.key, infoBancaireService.validation.formatIban(e.target.value)))
          }
          placeholder="FR76 1234 5678 9012 3456 7890 123"
          maxLength={34}
          className="w-full border border-gray-300 rounded px-2 py-1 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      );
    }

    return (
      <input
        type="text"
        name={field.key}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("volunteers.summary", "Résumé")}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          {t("volunteers.resume.hintPrefix")}{" "}
          <span className="font-semibold">{t("volunteers.resume.hintO")}</span>{" "}
          {t("volunteers.resume.hintForYes")}{" "}
          <span className="font-semibold">{t("volunteers.resume.hintN")}</span>{" "}
          {t("volunteers.resume.hintForNo")}{" "}
          <span className="font-semibold">{t("volunteers.resume.hintTab")}</span>{" "}
          {t("volunteers.resume.hintToNext")}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {t(
            "volunteers.resume.presetHint",
            "Pour les champs à choix prédéfinis : tapez la 1ère lettre pour sélectionner (répétez la touche pour cycler), ↑↓ pour naviguer, Backspace pour effacer.",
          )}
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {GROUPS.map((group) => (
          <section key={group.titleKey}>
            <h3 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-3">
              {t(`volunteers.resume.groups.${group.titleKey}`)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
              {group.fields.map((field) => {
                if (field.type === "subtitle") {
                  const subtitleLabel = t(`volunteers.resume.subtitles.${field.key}`);
                  return (
                    <div key={field.key} className="col-span-full mt-3 mb-1">
                      <h4 className="text-sm font-semibold text-gray-600 border-b border-gray-100 pb-1">
                        {subtitleLabel}
                      </h4>
                    </div>
                  );
                }
                const label = t(`volunteers.resume.fields.${field.key}`);
                return (
                  <div
                    key={field.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <label
                      htmlFor={field.key}
                      className="text-sm text-gray-700 flex-1 min-w-0 truncate"
                      title={label}
                    >
                      {label}
                    </label>
                    <div className="flex-shrink-0 w-40">{renderField(field)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
};

export default ResumeSection;
