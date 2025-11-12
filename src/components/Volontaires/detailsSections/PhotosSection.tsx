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
  onPhotoSelect: (photo: { url: string; alt: string }) => void;
}

const PhotosSection = ({
  volontaire,
  isUploadingPhoto,
  photoUploadError,
  onPhotoUpload,
  onPhotoSelect,
}: PhotosSectionProps) => (
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle>Photos du volontaire</CardTitle>
        <div>
          <label htmlFor="photo-upload">
            <Button
              asChild
              variant="default"
              disabled={isUploadingPhoto}
              className="cursor-pointer"
            >
              <span>{isUploadingPhoto ? 'Envoi en cours...' : 'Ajouter une photo'}</span>
            </Button>
          </label>
          <input
            id="photo-upload"
            type="file"
            accept="image/jpeg,image/jpg"
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
        Photos disponibles pour ce volontaire
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">Photo de face</CardTitle>
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
                    alt: 'Photo de face de ' + volontaire.nomVol,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">Photo de profil droit</CardTitle>
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
                    alt: 'Photo de profil droit de ' + volontaire.nomVol,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="p-3 bg-gray-50">
            <CardTitle className="text-sm font-medium">Photo de profil gauche</CardTitle>
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
                    alt: 'Photo de profil gauche de ' + volontaire.nomVol,
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

export default PhotosSection;
