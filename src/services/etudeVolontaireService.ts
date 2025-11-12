import api from "./api";
import { EtudeVolontaire } from "../types/types";

// Helper function to parse numbers safely
const parseNum = (value: string | number | undefined | null): number => {
  return parseInt(String(value || 0)) || 0;
};

// Service corrigé pour correspondre exactement à l'API Spring Boot
const etudeVolontaireService = {
  // Fonction utilitaire pour vérifier si un ID est valide
  isValidId(id: string | number | undefined | null): boolean {
    return (
      id !== undefined &&
      id !== null &&
      id !== "undefined" &&
      id !== "null" &&
      id !== ""
    );
  },

  // Fonction pour valider les données d'une association étude-volontaire
  validateEtudeVolontaireData(data: Partial<EtudeVolontaire>): string[] {
    const errors = [];

    if (!this.isValidId(data.idEtude)) {
      errors.push("L'identifiant de l'étude est requis");
    }

    if (!this.isValidId(data.idVolontaire)) {
      errors.push("L'identifiant du volontaire est requis");
    }

    if (data.idGroupe !== undefined && data.idGroupe < 0) {
      errors.push("L'identifiant du groupe doit être positif");
    }

    if (data.iv !== undefined && data.iv < 0) {
      errors.push("L'indemnité volontaire doit être positive");
    }

    if (data.paye !== 0 && data.paye !== 1) {
      errors.push("L'indicateur de paiement doit être 0 ou 1");
    }

    const statutsValides = [
      "INSCRIT",
      "CONFIRME",
      "ANNULE",
      "TERMINE",
      "RESERVE",
    ];
    if (!data.statut || !statutsValides.includes(data.statut.toUpperCase())) {
      errors.push(
        `Le statut doit être l'un des suivants: ${statutsValides.join(", ")}`
      );
    }

    return errors;
  },

  // Fonction pour transformer les données
  transformEtudeVolontaireData(data: Partial<EtudeVolontaire>): EtudeVolontaire | null {
    if (!data) return null;

    return {
      idEtude: parseInt(String(data.idEtude || 0)),
      idVolontaire: parseInt(String(data.idVolontaire || 0)),
      idGroupe: parseInt(String(data.idGroupe || 0)) || 0,
      iv: parseInt(String(data.iv || 0)) || 0, // Convertir en entier pour l'API
      numsujet: parseInt(String(data.numsujet || 0)) || 0,
      paye: parseInt(String(data.paye || 0)) || 0,
      statut: String(data.statut) || "INSCRIT",
    };
  },

  // Récupérer toutes les associations
  async getAll() {
    try {
      const response = await api.get("/etude-volontaires");
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des associations:", error);
      throw error;
    }
  },

  // Récupérer avec pagination
  async getPaginated(page = 0, size = 10) {
    try {
      const response = await api.get("/etude-volontaires/paginated", {
        params: { page, size },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération paginée:", error);
      throw error;
    }
  },

  // Récupérer les volontaires par étude
  async getVolontairesByEtude(idEtude: string | number): Promise<any> {
    try {
      if (!this.isValidId(idEtude)) {
        throw new Error("L'identifiant de l'étude est requis");
      }
      const response = await api.get(`/etude-volontaires/etude/${idEtude}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des volontaires:", error);
      throw error;
    }
  },

  // Récupérer les études par volontaire
  async getEtudesByVolontaire(idVolontaire: string | number): Promise<any> {
    try {
      if (!this.isValidId(idVolontaire)) {
        throw new Error("L'identifiant du volontaire est requis");
      }
      const response = await api.get(
        `/etude-volontaires/volontaire/${idVolontaire}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des études:", error);
      throw error;
    }
  },

  // Récupérer par groupe
  async getByGroupe(idGroupe: string | number): Promise<any> {
    try {
      if (!this.isValidId(idGroupe)) {
        throw new Error("L'identifiant du groupe est requis");
      }
      const response = await api.get(`/etude-volontaires/groupe/${idGroupe}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération par groupe:", error);
      throw error;
    }
  },

  // Récupérer par statut
  async getByStatut(statut: string): Promise<any> {
    try {
      if (!statut) {
        throw new Error("Le statut est requis");
      }
      const response = await api.get(`/etude-volontaires/statut/${statut}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération par statut:", error);
      throw error;
    }
  },

  // Récupérer par indicateur de paiement
  async getByPaye(paye: number): Promise<any> {
    try {
      if (paye !== 0 && paye !== 1) {
        throw new Error("L'indicateur de paiement doit être 0 ou 1");
      }
      const response = await api.get(`/etude-volontaires/paye/${paye}`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération par paiement:", error);
      throw error;
    }
  },

  // Créer une nouvelle association
  async create(etudeVolontaireData: Partial<EtudeVolontaire>): Promise<any> {
    try {
      const transformedData =
        this.transformEtudeVolontaireData(etudeVolontaireData);

      if (!transformedData) {
        throw new Error("Données invalides");
      }

      // Validation des données
      const errors = this.validateEtudeVolontaireData(transformedData);
      if (errors.length > 0) {
        throw new Error(`Erreurs de validation: ${errors.join(", ")}`);
      }

      const response = await api.post("/etude-volontaires", transformedData);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'association:", error);
      throw error;
    }
  },

  // Vérifier si une association existe
  async checkAssociationFromData(idEtude: string | number, idVolontaire: string | number): Promise<boolean> {
    try {
      const associations = await this.getVolontairesByEtude(idEtude);
      return associations.some(
        (assoc: EtudeVolontaire) => assoc.idVolontaire === parseInt(String(idVolontaire))
      );
    } catch (err) {
      console.warn("Impossible de vérifier l'association:", err);
      return false; // Assume pas d'association en cas d'erreur
    }
  },

  // Alias convivial: existence par etude et volontaire
  async existsByEtudeAndVolontaire(idEtude: string | number, idVolontaire: string | number): Promise<boolean> {
    return this.checkAssociationFromData(idEtude, idVolontaire);
  },

  // Compter les volontaires par étude
  async countVolontairesByEtude(idEtude: string | number): Promise<any> {
    try {
      if (!this.isValidId(idEtude)) {
        throw new Error("L'identifiant de l'étude est requis");
      }
      const response = await api.get(
        `/etude-volontaires/count/volontaires/${idEtude}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du comptage des volontaires:", error);
      throw error;
    }
  },

  // Compter les études par volontaire
  async countEtudesByVolontaire(idVolontaire: string | number): Promise<any> {
    try {
      if (!this.isValidId(idVolontaire)) {
        throw new Error("L'identifiant du volontaire est requis");
      }
      const response = await api.get(
        `/etude-volontaires/count/etudes/${idVolontaire}`
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors du comptage des études:", error);
      throw error;
    }
  },

  // Mettre à jour le statut (corrigé pour correspondre à l'API Spring Boot)
  async updateStatut(associationId: EtudeVolontaire, nouveauStatut: string): Promise<any> {
    try {
      if (!nouveauStatut) {
        throw new Error("Le nouveau statut est requis");
      }

      const params = {
        idEtude: parseInt(String(associationId.idEtude)),
        idGroupe: parseInt(String(associationId.idGroupe || 0)) || 0,
        idVolontaire: parseInt(String(associationId.idVolontaire)),
        iv: parseInt(String(associationId.iv || 0)) || 0,
        numsujet: parseInt(String(associationId.numsujet || 0)) || 0,
        paye: parseInt(String(associationId.paye || 0)) || 0,
        statut: String(associationId.statut) || "INSCRIT",
        nouveauStatut: String(nouveauStatut),
      };

      const response = await api.patch(
        "/etude-volontaires/update-statut",
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  },

  // Mettre à jour l'indicateur de paiement (corrigé pour correspondre à l'API Spring Boot)
  async updatePaye(associationId: EtudeVolontaire, nouveauPaye: number): Promise<any> {
    try {
      if (nouveauPaye !== 0 && nouveauPaye !== 1) {
        throw new Error("L'indicateur de paiement doit être 0 ou 1");
      }

      const params = {
        idEtude: parseInt(String(associationId.idEtude)),
        idGroupe: parseInt(String(associationId.idGroupe || 0)) || 0,
        idVolontaire: parseInt(String(associationId.idVolontaire)),
        iv: parseInt(String(associationId.iv || 0)) || 0,
        numsujet: parseInt(String(associationId.numsujet || 0)) || 0,
        paye: parseInt(String(associationId.paye || 0)) || 0,
        statut: String(associationId.statut) || "INSCRIT",
        nouveauPaye: parseInt(String(nouveauPaye)),
      };

      const response = await api.patch("/etude-volontaires/update-paye", null, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement:", error);
      throw error;
    }
  },

  // Mettre à jour l'indemnité volontaire (IV) - CORRIGÉ
  async updateIV(associationId: EtudeVolontaire, nouvelIV: number): Promise<any> {
    try {
      if (nouvelIV < 0) {
        throw new Error("L'indemnité volontaire doit être positive");
      }

      // Construire les paramètres exactement comme attendu par l'API Spring Boot
      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv), // IV actuelle
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
        nouvelIV: parseNum(nouvelIV), // Nouvelle IV
      };

      const response = await api.patch("/etude-volontaires/update-iv", null, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'IV:", error);
      throw error;
    }
  },

  // Mettre à jour le paiement et l'IV simultanément (corrigé)
  async updatePayeAndIV(associationId: EtudeVolontaire, nouveauPaye: number, nouvelIV: number): Promise<any> {
    try {
      if (nouveauPaye !== 0 && nouveauPaye !== 1) {
        throw new Error("L'indicateur de paiement doit être 0 ou 1");
      }
      if (nouvelIV < 0) {
        throw new Error("L'indemnité volontaire doit être positive");
      }

      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv),
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
        nouveauPaye: parseNum(nouveauPaye),
        nouvelIV: parseNum(nouvelIV),
      };

      const response = await api.patch(
        "/etude-volontaires/update-paye-iv",
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du paiement et IV:", error);
      throw error;
    }
  },

  // Récupérer la valeur de l'IV (corrigé)
  async getIV(associationId: EtudeVolontaire): Promise<any> {
    try {
      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv),
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
      };

      const response = await api.get("/etude-volontaires/get-iv", { params });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de l'IV:", error);
      throw error;
    }
  },

  // Supprimer une association (corrigé)
  async delete(associationId: EtudeVolontaire): Promise<void> {
    try {
      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv),
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
      };

      await api.delete("/etude-volontaires/delete", { params });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      throw error;
    }
  },

  // Fonction utilitaire pour créer un ID d'association
  createAssociationId(
    idEtude: string | number,
    idGroupe: string | number,
    idVolontaire: string | number,
    iv: string | number,
    numsujet: string | number,
    paye: string | number,
    statut: string
  ): EtudeVolontaire {
    return {
      idEtude: parseNum(idEtude),
      idGroupe: parseNum(idGroupe),
      idVolontaire: parseNum(idVolontaire),
      iv: parseNum(iv),
      numsujet: parseNum(numsujet),
      paye: parseNum(paye),
      statut: String(statut) || "INSCRIT",
    };
  },

  // Fonction pour assigner un volontaire à une étude avec indemnité
  async assignerVolontaireAEtude(
    idEtude: string | number,
    idVolontaire: string | number,
    iv: string | number = 0,
    idGroupe: string | number = 0,
    statut: string = "INSCRIT"
  ): Promise<any> {
    try {
      // Vérifier si l'association existe déjà
      const exists = await this.existsByEtudeAndVolontaire(
        idEtude,
        idVolontaire
      );
      if (exists) {
        throw new Error("Ce volontaire est déjà assigné à cette étude");
      }

      // Créer l'association
      const associationData = {
        idEtude: parseNum(idEtude),
        idVolontaire: parseNum(idVolontaire),
        idGroupe: parseNum(idGroupe),
        iv: parseNum(iv), // Convertir en entier
        numsujet: 0,
        paye: parseNum(iv) > 0 ? 1 : 0, // Si IV > 0, alors payé
        statut: String(statut),
      };

      return await this.create(associationData);
    } catch (error) {
      console.error("Erreur lors de l'assignation du volontaire:", error);
      throw error;
    }
  },

  // Fonction pour désassigner un volontaire d'une étude
  async desassignerVolontaireDEtude(idEtude: string | number, idVolontaire: string | number): Promise<void> {
    try {
      // Récupérer les associations existantes
      const response = await this.getVolontairesByEtude(idEtude);
      //  SÉCURITÉ : S'assurer que 'associations' est toujours un tableau
      const associations = Array.isArray(response) ? response : (response?.data || []);

      const association = associations.find(
        (a: EtudeVolontaire) => a.idVolontaire === parseNum(idVolontaire)
      );

      if (!association) {
        throw new Error("Association non trouvée");
      }

      // Créer l'ID de l'association pour la suppression
      const associationId = this.createAssociationId(
        association.idEtude,
        association.idGroupe,
        association.idVolontaire,
        association.iv,
        association.numsujet,
        association.paye,
        association.statut
      );

      await this.delete(associationId);
    } catch (error) {
      console.error("Erreur lors de la désassignation du volontaire:", error);
      throw error;
    }
  },

  /**
   * 🎯 Créer plusieurs associations d'un coup avec toutes les valeurs
   */
  async createBatch(associations: Partial<EtudeVolontaire>[]): Promise<any> {
    try {
      // Valider et transformer chaque association
      const validAssociations = associations.map((assoc: Partial<EtudeVolontaire>) => {
        const transformedData = this.transformEtudeVolontaireData(assoc);

        if (!transformedData) {
          throw new Error(`Données invalides pour l'association`);
        }

        // Validation
        const errors = this.validateEtudeVolontaireData(transformedData);
        if (errors.length > 0) {
          throw new Error(
            `Erreurs pour volontaire ${transformedData.idVolontaire
            }: ${errors.join(", ")}`
          );
        }

        return transformedData;
      });

      const response = await api.post("/etude-volontaires/create-batch", {
        associations: validAssociations,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Erreur création en lot:", error);
      throw error;
    }
  },

  // Mettre à jour l'idVolontaire (peut être null pour désassigner)
  async updateVolontaire(associationId: EtudeVolontaire, nouveauVolontaireId: string | number | null): Promise<any> {
    try {

      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv),
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
        nouveauVolontaireId: nouveauVolontaireId // null pour désassigner
      };
      const response = await api.patch("/etude-volontaires/update-volontaire", null, {
        params
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du volontaire:", error);
      throw error;
    }
  },

  // Mettre à jour le numéro de sujet (MANQUANT dans votre service !)
  async updateNumSujet(associationId: EtudeVolontaire, nouveauNumSujet: string | number): Promise<any> {
    try {
      const params = {
        idEtude: parseNum(associationId.idEtude),
        idGroupe: parseNum(associationId.idGroupe),
        idVolontaire: parseNum(associationId.idVolontaire),
        iv: parseNum(associationId.iv),
        numsujet: parseNum(associationId.numsujet),
        paye: parseNum(associationId.paye),
        statut: String(associationId.statut) || "INSCRIT",
        nouveauNumSujet: parseNum(nouveauNumSujet)
      };

      const response = await api.patch("/etude-volontaires/update-numsujet", null, {
        params
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du numsujet:", error);
      throw error;
    }
  },
  
};

export default etudeVolontaireService;
