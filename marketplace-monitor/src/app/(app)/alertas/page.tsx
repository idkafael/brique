import { auth } from '@/auth';
import { getAlertsWithListings } from '@/services/alert-service';
import { AlertsList } from './list';

export default async function AlertasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const alerts = await getAlertsWithListings(session.user.id);

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Alertas</h2>
      <AlertsList initial={alerts} />
    </>
  );
}
