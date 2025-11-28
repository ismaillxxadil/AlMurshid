"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Get all dependencies for tasks in a project
 */
export async function getProjectDependencies(projectId: number) {
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

    // Get all task IDs for this project
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("project_id", projectId);

    if (!tasks || tasks.length === 0) {
      return { success: true, dependencies: [] };
    }

    const taskIds = tasks.map(t => t.id);

    // Get dependencies for these tasks
    const { data, error } = await supabase
      .from("task_dependencies")
      .select("*")
      .in("task_id", taskIds);

    if (error) {
      return { error: error.message };
    }

    return { success: true, dependencies: data };
  } catch (err) {
    console.error("Error fetching dependencies:", err);
    return { error: "Failed to fetch dependencies" };
  }
}

/**
 * Get dependencies for a specific task
 */
export async function getTaskDependencies(taskId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    const { data, error } = await supabase
      .from("task_dependencies")
      .select("*")
      .eq("task_id", taskId);

    if (error) {
      return { error: error.message };
    }

    return { success: true, dependencies: data };
  } catch (err) {
    console.error("Error fetching task dependencies:", err);
    return { error: "Failed to fetch task dependencies" };
  }
}

/**
 * Add a dependency (predecessor) to a task
 */
export async function addTaskDependency(
  taskId: number,
  predecessorTaskId: number,
  projectId: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  // Prevent self-dependency
  if (taskId === predecessorTaskId) {
    return { error: "A task cannot depend on itself" };
  }

  try {
    // Verify user owns the project and both tasks exist
    const { data: task } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", taskId)
      .single();

    const { data: predecessorTask } = await supabase
      .from("tasks")
      .select("project_id")
      .eq("id", predecessorTaskId)
      .single();

    if (!task || !predecessorTask) {
      return { error: "Task not found" };
    }

    if (task.project_id !== projectId || predecessorTask.project_id !== projectId) {
      return { error: "Tasks must belong to the same project" };
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return { error: "Project not found or unauthorized" };
    }

    // Check for circular dependencies
    const isCircular = await checkCircularDependency(supabase, taskId, predecessorTaskId);
    if (isCircular) {
      return { error: "This would create a circular dependency" };
    }

    const { data, error } = await supabase
      .from("task_dependencies")
      .insert([
        {
          task_id: taskId,
          predecessor_task_id: predecessorTaskId,
        },
      ])
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return { error: "This dependency already exists" };
      }
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true, dependency: data };
  } catch (err) {
    console.error("Error adding dependency:", err);
    return { error: "Failed to add dependency" };
  }
}

/**
 * Remove a dependency
 */
export async function removeTaskDependency(
  dependencyId: number,
  projectId: number
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

    const { error } = await supabase
      .from("task_dependencies")
      .delete()
      .eq("id", dependencyId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true };
  } catch (err) {
    console.error("Error removing dependency:", err);
    return { error: "Failed to remove dependency" };
  }
}

/**
 * Bulk insert dependencies (used when generating plan)
 */
export async function bulkCreateDependencies(
  projectId: number,
  dependencies: Array<{
    task_id: number;
    predecessor_task_id: number;
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

    if (dependencies.length === 0) {
      return { success: true, dependencies: [] };
    }

    const { data, error } = await supabase
      .from("task_dependencies")
      .insert(dependencies)
      .select();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/${projectId}`, "layout");
    return { success: true, dependencies: data };
  } catch (err) {
    console.error("Error bulk creating dependencies:", err);
    return { error: "Failed to create dependencies" };
  }
}

/**
 * Check if adding a dependency would create a circular reference
 */
async function checkCircularDependency(
  supabase: any,
  taskId: number,
  predecessorTaskId: number
): Promise<boolean> {
  // Check if predecessorTask depends on taskId (directly or indirectly)
  const visited = new Set<number>();
  const queue = [predecessorTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === taskId) {
      return true; // Circular dependency found
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    // Get all tasks that current depends on
    const { data } = await supabase
      .from("task_dependencies")
      .select("predecessor_task_id")
      .eq("task_id", current);

    if (data) {
      queue.push(...data.map((d: any) => d.predecessor_task_id));
    }
  }

  return false;
}
