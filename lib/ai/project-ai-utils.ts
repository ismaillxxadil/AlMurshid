/**
 * Utilities for project AI assistant
 * Handles parsing AI responses for task modifications and actions
 */

import { Task } from '@/lib/types/task';

export type AIAction = 
  | { type: 'update_task'; taskId: string; updates: Partial<Task> }
  | { type: 'add_subtask'; parentTaskId: string; subtask: Omit<Task, 'id'> }
  | { type: 'message'; content: string };

/**
 * Parse AI response to extract structured actions
 * Returns both the message and any actions the AI wants to perform
 */
export function parseAIResponse(response: string): {
  message: string;
  actions: AIAction[];
} {
  const actions: AIAction[] = [];
  let message = response;

  // Extract JSON code blocks
  const jsonBlocks = response.match(/```json\n([\s\S]*?)\n```/g);
  
  if (jsonBlocks) {
    jsonBlocks.forEach(block => {
      const jsonContent = block.replace(/```json\n|```/g, '');
      try {
        const parsed = JSON.parse(jsonContent);
        
        if (parsed.action === 'update_task') {
          actions.push({
            type: 'update_task',
            taskId: parsed.taskId,
            updates: parsed.updates,
          });
        } else if (parsed.action === 'add_subtask') {
          actions.push({
            type: 'add_subtask',
            parentTaskId: parsed.parentTaskId,
            subtask: parsed.subtask,
          });
        }
        
        // Remove the JSON block from the message
        message = message.replace(block, '').trim();
      } catch (e) {
        console.warn('Failed to parse AI action JSON:', e);
      }
    });
  }

  return { message, actions };
}

/**
 * Generate a summary of what the AI action will do
 * Useful for showing confirmations to the user
 */
export function describeAction(action: AIAction): string {
  switch (action.type) {
    case 'update_task':
      const updates = Object.keys(action.updates);
      return `Update task: ${updates.join(', ')}`;
    
    case 'add_subtask':
      return `Add new subtask: ${action.subtask.name}`;
    
    case 'message':
      return 'Message';
  }
}

/**
 * Validate that a task update is safe and reasonable
 */
export function validateTaskUpdate(updates: Partial<Task>): { valid: boolean; error?: string } {
  if (updates.xp !== undefined) {
    if (updates.xp < 10 || updates.xp > 500) {
      return { valid: false, error: 'XP must be between 10 and 500' };
    }
  }

  if (updates.difficulty !== undefined) {
    if (!['easy', 'medium', 'hard', 'expert'].includes(updates.difficulty)) {
      return { valid: false, error: 'Invalid difficulty level' };
    }
  }

  if (updates.timeEstimate !== undefined) {
    if (updates.timeEstimate < 0.5 || updates.timeEstimate > 40) {
      return { valid: false, error: 'Time estimate must be between 0.5 and 40 hours' };
    }
  }

  return { valid: true };
}
