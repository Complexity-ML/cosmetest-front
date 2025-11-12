import React from 'react';
import { Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIconProps {
  status: 'loading' | 'success' | 'error' | null;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  switch (status) {
    case 'loading':
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    case 'success':
      return <Check className="h-4 w-4 text-green-600 font-semibold" />;
    case 'error':
      return <X className="h-4 w-4 text-red-600 font-semibold" />;
    default:
      return null;
  }
};

export default StatusIcon;
