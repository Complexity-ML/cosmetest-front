import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, ChevronRight } from 'lucide-react';
import FormTabs from '../../components/Volontaires/FormTabs';
import { renderVolontaireFormSection } from '../../components/Volontaires/formSections';
import { useVolontaireForm } from './hooks/useVolontaireForm';

const VolontaireForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const {
    activeTab,
    setActiveTab,
    formData,
    errors,
    isLoading,
    isSaving,
    formError,
    formSuccess,
    handleChange,
    handleSubmit,
  } = useVolontaireForm({ id, isEditMode, navigate });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          to="/volontaires"
          className="text-gray-500 hover:text-primary-600"
        >
          {t('sidebar.volunteers')}
        </Link>
        <ChevronRight className="mx-2 text-gray-400 h-4 w-4" />
        <span className="font-medium">
          {isEditMode
            ? `${t('common.edit')} ${formData.prenom} ${formData.nom}`
            : t('volunteers.newVolunteer')}
        </span>
      </div>

      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {isEditMode ? t('volunteers.editVolunteer') : t('volunteers.addVolunteer')}
          </h1>

          {formError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {formSuccess && (
            <Alert className="mb-6 bg-green-50 border-green-500">
              <AlertDescription className="text-green-700">{formSuccess}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Onglets pour la navigation */}
            <FormTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Contenu de l'onglet actif */}
            {renderVolontaireFormSection({
              activeTab,
              formData,
              errors,
              onChange: handleChange,
              volontaireId: id,
            })}

            {/* Boutons de formulaire */}
            <div className="flex justify-end gap-3">
              <Button asChild variant="outline">
                <Link to={isEditMode ? `/volontaires/${id}` : "/volontaires"}>
                  {t('common.cancel')}
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('volunteers.saving')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolontaireForm;
