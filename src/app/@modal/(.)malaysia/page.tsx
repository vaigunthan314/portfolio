import { MalaysiaContent } from '@/components/MalaysiaContent';
import MalaysiaOverlay from '@/components/MalaysiaOverlay';

export default function MalaysiaModal() {
  return (
    <MalaysiaOverlay>
      <MalaysiaContent variant="overlay" />
    </MalaysiaOverlay>
  );
}
