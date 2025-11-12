import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
  </div>
);

export default LoadingSpinner;