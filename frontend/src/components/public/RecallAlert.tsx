import { AlertCircle } from 'lucide-react';

interface RecallAlertProps {
  message: string;
}

export const RecallAlert = ({ message }: RecallAlertProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-red-800">
        <p className="font-semibold">Cảnh báo thu hồi</p>
        <p className="mt-0.5">{message}</p>
      </div>
    </div>
  );
};