import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import GeneratePageClient from './generate-client';

export default async function ProjectFirstGeneratePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId: projectIdParam } = await params;
  const projectId = parseInt(projectIdParam);
  
  if (isNaN(projectId)) {
    redirect('/dashboard');
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Fetch user profile to get level
  const { data: profile } = await supabase
    .from('profiles')
    .select('level')
    .eq('id', user.id)
    .single();

  const userLevel = profile?.level || 1;

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

  return <GeneratePageClient projectId={projectId} projectName={project.name || ''} userLevel={userLevel} />;
}
