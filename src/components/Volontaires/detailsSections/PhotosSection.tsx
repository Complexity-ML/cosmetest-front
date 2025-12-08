import { useTranslation } from 'react-i18next';
import VolontairePhoto from '../VolontairePhoto';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';

interface PhotosSectionProps {
  volontaire: {
    id: number | string;
    nomVol: string;
  };
  isUploadingPhoto: boolean;
  photoUploadError: string | null;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPhotoSelect: (photo: { url: string; alt: string; isPdf?: boolean }) => void;
}

const PhotosSection = ({
  volontaire,
  isUploadingPhoto,
  photoUploadError,
  onPhotoUpload,
  onPhotoSelect,
}: PhotosSectionProps) => {
  const { t } = useTranslation();

  return (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>{t('volunteers.volunteerPhotos')}</CardTitle>
        <div>
          <label htmlFor="photo-upload">
            <Button
              asChild
              variant="default"
              disabled={isUploadingPhoto}
              className="cursor-pointer"
            >
              <span>{isUploadingPhoto ? t('volunteers.uploadingPhoto') : t('volunteers.addPhoto')}</span>
            </Button>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            className="hidden"
            onChange={onPhotoUpload}
            disabled={isUploadingPhoto}
          />
        </div>
      </div>
    </CardHeader>

    <CardContent className="space-y-4">
      {photoUploadError && (
        <Alert variant="destructive">
          <AlertDescription>{photoUploadError}</AlertDescription>
        </Alert>
      )}

      <p className="text-sm text-brand-cyan">
        {t('volunteers.availablePhotos')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">{t('volunteers.frontPhoto')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-square">
              <VolontairePhoto
                volontaireId={volontaire.id}
                photoType="face"
                className="w-full h-full"
                onPhotoLoad={() => console.log('Photo de face chargee')}
                onPhotoError={() => console.log('Erreur photo face')}
                onPhotoClick={(photo) =>
                  onPhotoSelect({
                    url: photo.url,
                    alt: t('volunteers.frontPhotoOf') + ' ' + volontaire.nomVol,
                    isPdf: photo.isPdf,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">{t('volunteers.rightProfilePhoto')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-square">
              <VolontairePhoto
                volontaireId={volontaire.id}
                photoType="droite"
                className="w-full h-full"
                onPhotoLoad={() => console.log('Photo de profil droit chargee')}
                onPhotoError={() => console.log('Erreur photo profil droit')}
                onPhotoClick={(photo) =>
                  onPhotoSelect({
                    url: photo.url,
                    alt: t('volunteers.rightProfilePhotoOf') + ' ' + volontaire.nomVol,
                    isPdf: photo.isPdf,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">{t('volunteers.leftProfilePhoto')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-square">
              <VolontairePhoto
                volontaireId={volontaire.id}
                photoType="gauche"
                className="w-full h-full"
                onPhotoLoad={() => console.log('Photo de profil gauche chargee')}
                onPhotoError={() => console.log('Erreur photo profil gauche')}
                onPhotoClick={(photo) =>
                  onPhotoSelect({
                    url: photo.url,
                    alt: t('volunteers.leftProfilePhotoOf') + ' ' + volontaire.nomVol,
                    isPdf: photo.isPdf,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  </Card>
  );
};

export default PhotosSection;
