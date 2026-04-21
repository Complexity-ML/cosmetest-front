import { useTranslation } from 'react-i18next';
import groupeService from '../../../services/groupeService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import { EtudeData, GroupeData } from '../../../types/etude.types';
import React, { useState } from 'react';

interface GroupesSectionProps {
  etude: EtudeData;
  showGroupeForm: boolean;
  setShowGroupeForm: (show: boolean) => void;
  newGroupe: GroupeData;
  handleGroupeChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  ethniesDisponibles: readonly string[];
  handleEthnieChange: (ethnie: string) => void;
  phototypesDisponibles?: readonly string[];
  handlePhototypeChange?: (phototype: string) => void;
  handleCreateGroupe: (e: React.FormEvent) => void;
  isLoadingGroupes: boolean;
  groupes: GroupeData[];
  fetchGroupes: () => void;
}

const phototypesDefaut = ['Type 1', 'Type 2', 'Type 3', 'Type 4', 'Type 5', 'Type 6'] as const;

const GroupesSection = ({
  etude,
  showGroupeForm,
  setShowGroupeForm,
  newGroupe,
  handleGroupeChange,
  ethniesDisponibles,
  handleEthnieChange,
  phototypesDisponibles = phototypesDefaut,
  handlePhototypeChange,
  handleCreateGroupe,
  isLoadingGroupes,
  groupes,
  fetchGroupes,
}: GroupesSectionProps) => {
  const { t } = useTranslation();
  const [editingIv, setEditingIv] = useState<number | null>(null);
  const [editIvValue, setEditIvValue] = useState<number>(0);
  const [isSavingIv, setIsSavingIv] = useState(false);
  const [editingGroupe, setEditingGroupe] = useState<GroupeData | null>(null);
  const [isSavingGroupe, setIsSavingGroupe] = useState(false);

  const toArray = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) return val.split(/[;,]/).map((s) => s.trim()).filter(Boolean);
    return [];
  };

  const handleOpenEdit = (groupe: GroupeData) => {
    setEditingGroupe({
      ...groupe,
      ethnie: toArray(groupe.ethnie) as any,
      phototype: toArray(groupe.phototype) as any,
    });
  };

  const handleEditFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingGroupe) return;
    const { name, value, type } = e.target;
    const v = type === 'number' ? (value === '' ? '' : Number(value)) : value;
    setEditingGroupe({ ...editingGroupe, [name]: v } as GroupeData);
  };

  const toggleEditArray = (field: 'ethnie' | 'phototype', option: string) => {
    if (!editingGroupe) return;
    const current = toArray((editingGroupe as any)[field]);
    const next = current.includes(option) ? current.filter((v) => v !== option) : [...current, option];
    setEditingGroupe({ ...editingGroupe, [field]: next } as GroupeData);
  };

  const handleSaveEdit = async () => {
    if (!editingGroupe || !editingGroupe.idGroupe) return;
    setIsSavingGroupe(true);
    try {
      await groupeService.update(editingGroupe.idGroupe, editingGroupe as any);
      setEditingGroupe(null);
      if (typeof fetchGroupes === 'function') {
        await fetchGroupes();
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour du groupe', err);
      alert('Erreur lors de la mise à jour du groupe');
    } finally {
      setIsSavingGroupe(false);
    }
  };

  const handleEditIv = (groupe: GroupeData) => {
    setEditingIv(groupe.idGroupe || null);
    setEditIvValue(groupe.iv || 0);
  };

  const handleSaveIv = async (groupe: GroupeData) => {
    if (!groupe.idGroupe) return;
    setIsSavingIv(true);
    try {
      // 1. Mettre à jour l'IV du groupe
      await groupeService.update(groupe.idGroupe, { ...groupe, iv: editIvValue } as any);

      // 2. Propager l'IV à tous les volontaires du groupe
      try {
        const volontaires = await etudeVolontaireService.getByGroupe(groupe.idGroupe);
        if (Array.isArray(volontaires) && volontaires.length > 0) {
          const updatePromises = volontaires.map((vol: any) =>
            etudeVolontaireService.updateIV(vol, editIvValue)
          );
          await Promise.all(updatePromises);
        }
      } catch (propagateErr) {
        console.error('Erreur lors de la propagation de l\'IV aux volontaires:', propagateErr);
      }

      setEditingIv(null);
      if (typeof fetchGroupes === 'function') {
        await fetchGroupes();
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'IV:', err);
      alert('Erreur lors de la mise à jour de l\'IV');
    } finally {
      setIsSavingIv(false);
    }
  };

  const onPhototypeChange = (phototype: string) => {
    if (handlePhototypeChange) {
      handlePhototypeChange(phototype);
    }
  };

  const handleDeleteGroupe = async (idGroupe: number) => {
    try {
      if (!idGroupe) return;
      const confirmed = window.confirm(t('studyDetails.deleteGroupConfirm'));
      if (!confirmed) return;

      const ok = await groupeService.delete(idGroupe);
      if (!ok) {
        alert(t('studyDetails.deletionImpossible'));
        return;
      }
      if (typeof fetchGroupes === 'function') {
        await fetchGroupes();
      }
    } catch (err) {
      console.error('Erreur suppression groupe', err);
      alert(t('groups.deleteError'));
    }
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{t('studies.groups')}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t('studyDetails.groupManagementFor')} {etude.ref}
          </p>
        </div>

        <button
          onClick={() => setShowGroupeForm(!showGroupeForm)}
          className="btn btn-primary inline-flex items-center"
        >
          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {t('studies.newGroup')}
        </button>
      </div>

      {/* Formulaire de création de groupe */}
      {showGroupeForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">{t('groups.createNewGroup')}</h4>
            <button
              onClick={() => setShowGroupeForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleCreateGroupe} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="intitule" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.groupTitle')} *
                </label>
                <input
                  type="text"
                  name="intitule"
                  id="intitule"
                  value={newGroupe.intitule}
                  onChange={handleGroupeChange}
                  className="form-input w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="nbSujet" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.subjectCount')}
                </label>
                <input
                  type="number"
                  name="nbSujet"
                  id="nbSujet"
                  value={newGroupe.nbSujet}
                  onChange={handleGroupeChange}
                  min="0"
                  className="form-input w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t('studies.description')}
              </label>
              <textarea
                name="description"
                id="description"
                value={newGroupe.description}
                onChange={handleGroupeChange}
                rows={2}
                className="form-textarea w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="ageMinimum" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.ageMin')}
                </label>
                <input
                  type="number"
                  name="ageMinimum"
                  id="ageMinimum"
                  value={newGroupe.ageMinimum}
                  onChange={handleGroupeChange}
                  min="0"
                  className="form-input w-full"
                />
              </div>

              <div>
                <label htmlFor="ageMaximum" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.ageMax')}
                </label>
                <input
                  type="number"
                  name="ageMaximum"
                  id="ageMaximum"
                  value={newGroupe.ageMaximum}
                  onChange={handleGroupeChange}
                  min="0"
                  className="form-input w-full"
                />
              </div>

              <div>
                <label htmlFor="iv" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('groups.volunteerCompensation')}
                </label>
                <input
                  type="number"
                  name="iv"
                  id="iv"
                  value={newGroupe.iv}
                  onChange={handleGroupeChange}
                  min="0"
                  className="form-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('groups.ethnicities')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {ethniesDisponibles.map((ethnieOption: string) => (
                  <label key={ethnieOption} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Array.isArray(newGroupe.ethnie) && newGroupe.ethnie.includes(ethnieOption)}
                      onChange={() => handleEthnieChange(ethnieOption)}
                      className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">
                      {ethnieOption.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('groups.phototypes') || 'Phototypes'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                {phototypesDisponibles.map((phototypeOption: string) => (
                  <label key={phototypeOption} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={Array.isArray(newGroupe.phototype) && newGroupe.phototype.includes(phototypeOption)}
                      onChange={() => onPhototypeChange(phototypeOption)}
                      className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {phototypeOption}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowGroupeForm(false)}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {t('studyDetails.createGroup')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des groupes */}
      {isLoadingGroupes ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : groupes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">{t('groups.noGroups')}</h3>
          <p className="mt-1 text-sm text-gray-500">{t('studyDetails.startByCreatingGroup')}</p>
          <div className="mt-6">
            <button
              onClick={() => setShowGroupeForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('studyDetails.createGroup')}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {groupes.map((groupe: GroupeData) => (
            <div key={groupe.idGroupe} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{groupe.intitule}</h4>
                    <div className="flex items-center space-x-2">
                      {groupe.nbSujet && (
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {groupe.nbSujet} {t('studies.subjects')}
                        </span>
                      )}
                      {editingIv === groupe.idGroupe ? (
                        <span className="flex items-center space-x-1">
                          <input
                            type="number"
                            value={editIvValue}
                            onChange={(e) => setEditIvValue(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveIv(groupe);
                              if (e.key === 'Escape') setEditingIv(null);
                            }}
                            min="0"
                            className="w-16 px-1 py-0.5 text-xs border border-green-300 rounded focus:ring-green-500 focus:border-green-500"
                            autoFocus
                            disabled={isSavingIv}
                          />
                          <span className="text-xs text-gray-500">€</span>
                          <button
                            onClick={() => handleSaveIv(groupe)}
                            disabled={isSavingIv}
                            className="text-green-600 hover:text-green-800"
                            title="Enregistrer"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingIv(null)}
                            className="text-gray-400 hover:text-gray-600"
                            title="Annuler"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ) : (
                        <span
                          className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full cursor-pointer hover:bg-green-200"
                          onClick={() => handleEditIv(groupe)}
                          title="Cliquer pour modifier l'IV"
                        >
                          {groupe.iv != null ? `${groupe.iv}€ IV` : 'IV non défini'}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 whitespace-pre-line">{groupe.description || t('studyDetails.noDescription')}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">{t('studyDetails.age')}:</span>
                      <span className="ml-2 text-gray-600">
                        {groupe.ageMinimum || groupe.ageMaximum
                          ? `${groupe.ageMinimum || t('groups.notSpecified')} - ${groupe.ageMaximum || t('groups.notSpecified')}`
                          : t('groups.notSpecified')}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('groups.ethnicities')}:</span>
                      <span className="ml-2 text-gray-600">
                        {Array.isArray(groupe.ethnie)
                          ? groupe.ethnie.join(', ')
                          : (typeof groupe.ethnie === 'string' ? groupe.ethnie.replace(/;/g, ', ') : t('groups.notSpecified'))}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('groups.phototypes') || 'Phototypes'}:</span>
                      <span className="ml-2 text-gray-600">
                        {Array.isArray(groupe.phototype)
                          ? groupe.phototype.join(', ')
                          : (typeof groupe.phototype === 'string' ? groupe.phototype.replace(/;/g, ', ') : t('groups.notSpecified'))}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">{t('studyDetails.criteria')}:</span>
                      <span className="ml-2 text-gray-600">
                        {groupe.criteresSupplementaires || t('studyDetails.none')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="ml-4 flex items-start space-x-2">
                  <button
                    onClick={() => handleOpenEdit(groupe)}
                    className="inline-flex items-center p-2 text-blue-500 hover:text-blue-700"
                    title="Modifier ce groupe"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => groupe.idGroupe && handleDeleteGroupe(groupe.idGroupe)}
                    className="inline-flex items-center p-2 text-red-500 hover:text-red-700"
                    title={t('studyDetails.deleteThisGroup')}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modale d'édition d'un groupe */}
      {editingGroupe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isSavingGroupe && setEditingGroupe(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h4 className="text-lg font-medium text-gray-900">Modifier le groupe</h4>
              <button
                onClick={() => setEditingGroupe(null)}
                className="text-gray-400 hover:text-gray-600"
                disabled={isSavingGroupe}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('groups.groupTitle')} *</label>
                  <input
                    type="text"
                    name="intitule"
                    value={editingGroupe.intitule || ''}
                    onChange={handleEditFieldChange}
                    className="form-input w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('groups.subjectCount')}</label>
                  <input
                    type="number"
                    name="nbSujet"
                    value={editingGroupe.nbSujet ?? ''}
                    onChange={handleEditFieldChange}
                    min="0"
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('studies.description')}</label>
                <textarea
                  name="description"
                  value={editingGroupe.description || ''}
                  onChange={handleEditFieldChange}
                  rows={2}
                  className="form-textarea w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('groups.ageMin')}</label>
                  <input
                    type="number"
                    name="ageMinimum"
                    value={editingGroupe.ageMinimum ?? ''}
                    onChange={handleEditFieldChange}
                    min="0"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('groups.ageMax')}</label>
                  <input
                    type="number"
                    name="ageMaximum"
                    value={editingGroupe.ageMaximum ?? ''}
                    onChange={handleEditFieldChange}
                    min="0"
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('groups.volunteerCompensation')}</label>
                  <input
                    type="number"
                    name="iv"
                    value={editingGroupe.iv ?? ''}
                    onChange={handleEditFieldChange}
                    min="0"
                    className="form-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('groups.ethnicities')}</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {ethniesDisponibles.map((ethnieOption: string) => (
                    <label key={ethnieOption} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={toArray(editingGroupe.ethnie).includes(ethnieOption)}
                        onChange={() => toggleEditArray('ethnie', ethnieOption)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{ethnieOption.toLowerCase()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('groups.phototypes') || 'Phototypes'}</label>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                  {phototypesDisponibles.map((phototypeOption: string) => (
                    <label key={phototypeOption} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={toArray(editingGroupe.phototype).includes(phototypeOption)}
                        onChange={() => toggleEditArray('phototype', phototypeOption)}
                        className="form-checkbox h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{phototypeOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('studyDetails.criteria')}</label>
                <textarea
                  name="criteresSupplementaires"
                  value={editingGroupe.criteresSupplementaires || ''}
                  onChange={handleEditFieldChange}
                  rows={2}
                  className="form-textarea w-full"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t">
              <button
                type="button"
                onClick={() => setEditingGroupe(null)}
                disabled={isSavingGroupe}
                className="btn btn-secondary"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSavingGroupe}
                className="btn btn-primary"
              >
                {isSavingGroupe ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupesSection
