import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function ProjectDefault({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const projectIdNum = parseInt(projectId);

  if (isNaN(projectIdNum)) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if project has been generated
  const { data: project } = await supabase
    .from('projects')
    .select('generate')
    .eq('id', projectIdNum)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    redirect('/dashboard');
  }

  // If not generated yet, redirect to generate page
  if (project.generate !== true) {
    redirect(`/dashboard/${projectId}/generate`);
  }

  // If generated, redirect to AI page
  redirect(`/dashboard/${projectId}/ai`);
}
