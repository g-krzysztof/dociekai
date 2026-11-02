import { Teczka } from './components/teczka';
import { kartkaFont } from './font';
import './materialy.css';

export default function MaterialyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`materialy-druk ${kartkaFont.variable}`}>
      {children}
      <Teczka />
    </div>
  );
}
