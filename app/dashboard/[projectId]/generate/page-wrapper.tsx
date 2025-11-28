import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import GeneratePageClient from './generate-client';

export default async function ProjectFirstGeneratePage({ params }: { params: { projectId: string } }) {
  const projectId = parseInt(params.projectId);
  
  if (isNaN(projectId)) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Check if user owns the project and if it's already been generated
  const { data: project, error } = await supabase
    .from('projects')
    .select('id, name, generate')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single();

  if (error || !project) {
    redirect('/dashboard');
  }

  // If project has already been generated, redirect to main project page
  if (project.generate === true) {
    redirect(`/dashboard/${projectId}`);
  }

  return <GeneratePageClient projectId={projectId} projectName={project.name || ''} />;
}
