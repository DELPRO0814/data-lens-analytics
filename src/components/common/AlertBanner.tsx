
import React from 'react';
import { AlertTriangle, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AlertBannerProps {
  alerts: Array<{
    id: string;
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  }>;
  onDismiss: (id: string) => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ alerts, onDismiss }) => {
  if (alerts.length === 0) return null;

  const getBackgroundColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-orange-100 border-orange-300';
      case 'info': return 'bg-blue-100 border-blue-300';
      case 'success': return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-orange-800';
      case 'info': return 'text-blue-800';
      case 'success': return 'text-green-800';
      default: return 'text-gray-800';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'info': return <Calendar className="w-5 h-5" />;
      case 'success': return <Calendar className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-2 mb-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`border rounded-lg p-4 ${getBackgroundColor(alert.type)} ${getTextColor(alert.type)}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getIcon(alert.type)}
              <div>
                <h4 className="font-semibold">{alert.title}</h4>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {alert.actionLabel && alert.onAction && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alert.onAction}
                  className="text-sm"
                >
                  {alert.actionLabel}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AlertBanner;
