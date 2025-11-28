"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all phases for a project
 */
export async function getProjectPhases(projectId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    const { data, error } = await supabase
      .from("phases")
      .select("*")
      .eq("project_id", projectId)
      .order("order_index", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { success: true, phases: data };
  } catch (err) {
    console.error("Error fetching phases:", err);
    return { error: "Failed to fetch phases" };
  }
}

/**
 * Create a new phase
 */
export async function createPhase(
  projectId: number,
  phaseData: {
    name: string;
    description: string;
    order_index: number;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    const { data, error } = await supabase
      .from("phases")
      .insert([
        {
          project_id: projectId,
          name: phaseData.name,
          description: phaseData.description,
          order_index: phaseData.order_index,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true, phase: data };
  } catch (err) {
    console.error("Error creating phase:", err);
    return { error: "Failed to create phase" };
  }
}

/**
 * Update a phase
 */
export async function updatePhase(
  phaseId: number,
  projectId: number,
  updates: {
    name?: string;
    description?: string;
    order_index?: number;
  }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    const { data, error } = await supabase
      .from("phases")
      .update(updates)
      .eq("id", phaseId)
      .eq("project_id", projectId)
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true, phase: data };
  } catch (err) {
    console.error("Error updating phase:", err);
    return { error: "Failed to update phase" };
  }
}

/**
 * Delete a phase
 */
export async function deletePhase(phaseId: number, projectId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    const { error } = await supabase
      .from("phases")
      .delete()
      .eq("id", phaseId)
      .eq("project_id", projectId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true };
  } catch (err) {
    console.error("Error deleting phase:", err);
    return { error: "Failed to delete phase" };
  }
}

/**
 * Bulk insert phases (used when generating plan)
 */
export async function bulkCreatePhases(
  projectId: number,
  phases: Array<{
    name: string;
    description: string;
    order_index: number;
  }>
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    const phasesToInsert = phases.map(phase => ({
      project_id: projectId,
      name: phase.name,
      description: phase.description,
      order_index: phase.order_index,
    }));

    const { data, error } = await supabase
      .from("phases")
      .insert(phasesToInsert)
      .select();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true, phases: data };
  } catch (err) {
    console.error("Error bulk creating phases:", err);
    return { error: "Failed to create phases" };
  }
}
