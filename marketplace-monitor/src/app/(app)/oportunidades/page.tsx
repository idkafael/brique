import { auth } from '@/auth';
import { getOpportunities } from '@/services/opportunities-service';
import { OpportunitiesList } from './list';

export default async function OportunidadesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const opportunities = await getOpportunities(session.user.id);

  return (
    <>
      <h2 className="text-xl font-semibold text-white mb-6">Oportunidades</h2>
      <OpportunitiesList initial={opportunities} />
    </>
  );
}
