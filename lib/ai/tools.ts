/**
 * AI Tool definitions for المرشد (Al-Murshid) assistant
 * These tools allow the AI to perform CRUD operations on tasks, phases, and dependencies
 */

import { tool } from 'ai';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';
import { 
  createTask, updateTask, deleteTask
} from '@/app/actions/tasks';
import {
  createPhase as createPhaseAction,
  updatePhase as updatePhaseAction,
  deletePhase as deletePhaseAction
} from '@/app/actions/phases';
import {
  addTaskDependency as addDependencyAction,
  removeTaskDependency as removeDependencyAction
} from '@/app/actions/dependencies';

/**
 * Task Management Tools
 */

export const createTaskTool = tool({
  description: 'Create a new task in the project. Use this when the user asks to add, create, or insert a new task.',
  parameters: z.object({
    projectId: z.number().describe('The project ID'),
    name: z.string().describe('Task name (3-7 words, action-oriented)'),
    description: z.string().describe('Task description (1-2 sentences)'),
    xp: z.number().min(10).max(500).describe('Experience points (10-50 easy, 50-150 medium, 150-300 hard, 300-500 expert)'),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).describe('Task difficulty level'),
    timeEstimate: z.number().min(0.5).max(40).describe('Estimated time in hours'),
    tools: z.string().optional().describe('JSON array of tools/technologies needed'),
    hints: z.string().optional().describe('JSON array of helpful hints'),
    status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional().describe('Initial status (default: not_started)'),
    phaseId: z.number().nullable().optional().describe('Phase ID this task belongs to'),
  }),
  execute: async ({ projectId, name, description, xp, difficulty, timeEstimate, tools, hints, status, phaseId }) => {
    try {
      const result = await createTask(projectId, {
        name,
        description,
        xp,
        difficulty,
        time_estimate: timeEstimate,
        tools,
        hints,
        status,
        phase_id: phaseId,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        task: result.task,
        message: `✅ تم إنشاء المهمة "${name}" بنجاح (${xp} XP)`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create task' 
      };
    }
  },
});

export const updateTaskTool = tool({
  description: 'Update an existing task. Use this to modify task properties like name, description, status, difficulty, XP, etc.',
  parameters: z.object({
    taskId: z.number().describe('The task ID to update'),
    projectId: z.number().describe('The project ID'),
    name: z.string().optional().describe('New task name'),
    description: z.string().optional().describe('New task description'),
    xp: z.number().min(10).max(500).optional().describe('New XP value'),
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']).optional().describe('New difficulty level'),
    timeEstimate: z.number().min(0.5).max(40).optional().describe('New time estimate in hours'),
    tools: z.string().optional().describe('New tools JSON array'),
    hints: z.string().optional().describe('New hints JSON array'),
    status: z.enum(['not_started', 'in_progress', 'completed', 'blocked']).optional().describe('New status'),
    phaseId: z.number().nullable().optional().describe('New phase ID'),
  }),
  execute: async ({ taskId, projectId, ...updates }) => {
    try {
      const result = await updateTask(taskId, projectId, {
        ...updates,
        time_estimate: updates.timeEstimate,
        phase_id: updates.phaseId,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        task: result.task,
        message: `✅ تم تحديث المهمة بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update task' 
      };
    }
  },
});

export const deleteTaskTool = tool({
  description: 'Delete a task from the project. Use this when the user asks to remove or delete a task.',
  parameters: z.object({
    taskId: z.number().describe('The task ID to delete'),
    projectId: z.number().describe('The project ID'),
  }),
  execute: async ({ taskId, projectId }) => {
    try {
      const result = await deleteTask(taskId, projectId);

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true,
        message: `✅ تم حذف المهمة بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete task' 
      };
    }
  },
});

/**
 * Phase Management Tools
 */

export const createPhaseTool = tool({
  description: 'Create a new phase in the project. Phases are logical groupings of tasks (e.g., Planning, Development, Testing).',
  parameters: z.object({
    projectId: z.number().describe('The project ID'),
    name: z.string().describe('Phase name (e.g., "Planning & Setup", "Core Development")'),
    description: z.string().describe('Phase description explaining what this phase accomplishes'),
    orderIndex: z.number().describe('Order of this phase in the project sequence (starting from 1)'),
  }),
  execute: async ({ projectId, name, description, orderIndex }) => {
    try {
      const result = await createPhaseAction(projectId, {
        name,
        description,
        order_index: orderIndex,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        phase: result.phase,
        message: `✅ تم إنشاء المرحلة "${name}" بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create phase' 
      };
    }
  },
});

export const updatePhaseTool = tool({
  description: 'Update an existing phase. Use this to modify phase name, description, or order.',
  parameters: z.object({
    phaseId: z.number().describe('The phase ID to update'),
    projectId: z.number().describe('The project ID'),
    name: z.string().optional().describe('New phase name'),
    description: z.string().optional().describe('New phase description'),
    orderIndex: z.number().optional().describe('New order index'),
  }),
  execute: async ({ phaseId, projectId, orderIndex, ...updates }) => {
    try {
      const result = await updatePhaseAction(phaseId, projectId, {
        ...updates,
        order_index: orderIndex,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        phase: result.phase,
        message: `✅ تم تحديث المرحلة بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update phase' 
      };
    }
  },
});

export const deletePhaseTool = tool({
  description: 'Delete a phase from the project. Tasks in this phase will become unassigned.',
  parameters: z.object({
    phaseId: z.number().describe('The phase ID to delete'),
    projectId: z.number().describe('The project ID'),
  }),
  execute: async ({ phaseId, projectId }) => {
    try {
      const result = await deletePhaseAction(phaseId, projectId);

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true,
        message: `✅ تم حذف المرحلة بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete phase' 
      };
    }
  },
});

/**
 * Dependency Management Tools
 */

export const addDependencyTool = tool({
  description: 'Add a dependency between tasks. This means one task must be completed before another can start.',
  parameters: z.object({
    taskId: z.number().describe('The task that depends on another (the dependent task)'),
    predecessorTaskId: z.number().describe('The task that must be completed first (the predecessor)'),
    projectId: z.number().describe('The project ID'),
  }),
  execute: async ({ taskId, predecessorTaskId, projectId }) => {
    try {
      const result = await addDependencyAction(taskId, predecessorTaskId, projectId);

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true, 
        dependency: result.dependency,
        message: `✅ تم إضافة التبعية بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add dependency' 
      };
    }
  },
});

export const removeDependencyTool = tool({
  description: 'Remove a dependency between tasks.',
  parameters: z.object({
    dependencyId: z.number().describe('The dependency ID to remove'),
    projectId: z.number().describe('The project ID'),
  }),
  execute: async ({ dependencyId, projectId }) => {
    try {
      const result = await removeDependencyAction(dependencyId, projectId);

      if (result.error) {
        return { success: false, error: result.error };
      }

      return { 
        success: true,
        message: `✅ تم إزالة التبعية بنجاح`
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove dependency' 
      };
    }
  },
});

/**
 * All tools combined for easy export
 */
export const alMurshidTools = {
  createTask: createTaskTool,
  updateTask: updateTaskTool,
  deleteTask: deleteTaskTool,
  createPhase: createPhaseTool,
  updatePhase: updatePhaseTool,
  deletePhase: deletePhaseTool,
  addDependency: addDependencyTool,
  removeDependency: removeDependencyTool,
};
