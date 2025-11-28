/**
 * Task difficulty levels for the gamified project planner
 */
export type TaskDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

/**
 * Task status for tracking progress
 */
export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked';

/**
 * Phase represents a logical grouping of tasks in the project lifecycle
 */
export interface Phase {
  /** Unique identifier for the phase */
  id: number;
  
  /** Project ID this phase belongs to */
  project_id: number;
  
  /** Name of the phase (e.g., "Planning", "Development", "Testing") */
  name: string;
  
  /** Description of what this phase accomplishes */
  description: string;
  
  /** Order of the phase in the project */
  order_index: number;
  
  /** When this phase was created */
  created_at?: string;
}

/**
 * Task object structure for gamified project planning
 * Each task represents a unit of work with gamification elements
 */
export interface Task {
  /** Unique identifier for the task */
  id: number;
  
  /** Project ID this task belongs to */
  project_id: number;
  
  /** Short, descriptive name of the task */
  name: string;
  
  /** Simple description explaining what the task involves */
  description: string;
  
  /** Experience points awarded upon completion */
  xp: number;
  
  /** Difficulty level of the task */
  difficulty: TaskDifficulty;
  
  /** Current status of the task */
  status: TaskStatus;
  
  /** Helpful hints or tips for completing the task (JSON string) */
  hints: string;
  
  /** Tools, technologies, or resources needed for the task (JSON string) */
  tools: string;
  
  /** Estimated time to complete (in hours) */
  time_estimate: number;
  
  /** Phase ID this task belongs to */
  phase_id?: number | null;
  
  /** When this task was created */
  created_at?: string;
}

/**
 * Task dependency relationship
 */
export interface TaskDependency {
  /** Unique identifier for the dependency */
  id: number;
  
  /** ID of the task that has the dependency */
  task_id: number;
  
  /** ID of the task that must be completed first */
  predecessor_task_id: number;
  
  /** When this dependency was created */
  created_at?: string;
}

/**
 * Task with populated predecessors array (for UI)
 */
export interface TaskWithDependencies extends Task {
  /** Array of predecessor task IDs */
  predecessors: number[];
}

/**
 * Project plan containing multiple tasks
 */
export interface ProjectPlan {
  /** Name of the project */
  projectName: string;
  
  /** Brief overview of the project */
  projectDescription: string;
  
  /** Detailed project brief for documentation */
  projectBrief: string;
  
  /** AI-optimized prompt that explains the project to external AI systems */
  aiPrompt: string;
  
  /** List of tasks that make up the project */
  tasks: Task[];
  
  /** Phases that organize tasks into logical groups */
  phases: Phase[];
  
  /** System constants (tools, features, technologies) */
  constants: SystemConstant[];
  
  /** Fragments (ideas, brainstorming notes) */
  fragments: Fragment[];
  
  /** Total XP available in the project */
  totalXP: number;
  
  /** Estimated total time for project completion */
  totalTime: number;
}

/**
 * System constants represent key project elements like tools and features
 * Stored in memory table with type='constants'
 */
export interface SystemConstant {
  /** Unique identifier */
  id: number;
  
  /** Project ID */
  project_id: number;
  
  /** Label/name of the constant */
  label: string;
  
  /** Description/content of the constant */
  content: string;
  
  /** Additional description */
  description?: string;
  
  /** Type of constant (tool, feature, technology, etc.) */
  category: 'tool' | 'feature' | 'technology' | 'methodology' | 'other';
  
  /** When this was created */
  created_at?: string;
}

/**
 * Fragments are brainstorming ideas or notes
 * Stored in memory table with type='fragments'
 */
export interface Fragment {
  /** Unique identifier */
  id: number;
  
  /** Project ID */
  project_id: number;
  
  /** Title of the fragment */
  label: string;
  
  /** Content of the idea/note */
  content: string;
  
  /** Additional description */
  description?: string;
  
  /** When this fragment was created */
  created_at?: string;
}

/**
 * Chat message structure for conversation history
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
