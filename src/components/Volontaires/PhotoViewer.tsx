import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PhotoViewerProps {
  photoUrl: string;
  alt: string;
  onClose: () => void;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({ photoUrl, alt, onClose }) => {
  // Fermer la visionneuse quand on appuie sur Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="max-w-4xl max-h-screen p-4">
        <img
          src={photoUrl}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default PhotoViewer;
