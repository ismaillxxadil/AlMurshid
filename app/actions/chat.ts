"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Create a new chat session for a project
 */
export async function createChatSession(projectId: number, title?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  // Verify user owns the project
  const { data: project } = await supabase
    .from("projects")
    .select("id, generate")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return { error: "Project not found or unauthorized" };
  }

  // Check if project has already been generated
  if (project.generate === true) {
    return { error: "Project has already been generated" };
  }

  try {
    const { data, error } = await supabase
      .from("chat_session")
      .insert([
        {
          user_id: user.id,
          project_id: projectId,
          title: title || "Project Planning Session",
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    return { success: true, session: data };
  } catch (err) {
    console.error("Error creating chat session:", err);
    return { error: "Failed to create chat session" };
  }
}

/**
 * Get or create a chat session for a project
 */
export async function getOrCreateChatSession(projectId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Check for existing session
    const { data: existingSession, error: fetchError } = await supabase
      .from("chat_session")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (existingSession && !fetchError) {
      return { success: true, session: existingSession };
    }

    // Create new session if none exists
    return await createChatSession(projectId);
  } catch (err) {
    console.error("Error in getOrCreateChatSession:", err);
    return { error: "Failed to get or create chat session" };
  }
}

/**
 * Get all messages for a chat session
 */
export async function getChatMessages(sessionId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the session
    const { data: session } = await supabase
      .from("chat_session")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return { error: "Chat session not found or unauthorized" };
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    return { success: true, messages: data };
  } catch (err) {
    console.error("Error fetching messages:", err);
    return { error: "Failed to fetch messages" };
  }
}

/**
 * Add a message to a chat session
 */
export async function addChatMessage(
  sessionId: number,
  role: "user" | "assistant" | "system",
  content: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the session
    const { data: session } = await supabase
      .from("chat_session")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return { error: "Chat session not found or unauthorized" };
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          session_id: sessionId,
          role: role,
          content: content,
        },
      ])
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/[projectId]/generate`, "page");
    return { success: true, message: data };
  } catch (err) {
    console.error("Error adding message:", err);
    return { error: "Failed to add message" };
  }
}

/**
 * Delete all messages in a chat session (reset conversation)
 */
export async function resetChatSession(sessionId: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "User not authenticated" };
  }

  try {
    // Verify user owns the session
    const { data: session } = await supabase
      .from("chat_session")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single();

    if (!session) {
      return { error: "Chat session not found or unauthorized" };
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      return { error: error.message };
    }

    revalidatePath(`/dashboard/[projectId]/generate`, "page");
    return { success: true };
  } catch (err) {
    console.error("Error resetting chat session:", err);
    return { error: "Failed to reset chat session" };
  }
}
