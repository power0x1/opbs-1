import { Check } from 'lucide-react';

export function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="toast">
      <Check size={16} />
      {message}
    </div>
  );
}
