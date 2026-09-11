import { Activity, Wifi } from 'lucide-react';

export function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <div className="status-icons">
        <Activity size={16} />
        <Wifi size={17} />
        <div className="battery" />
      </div>
    </div>
  );
}
