// src/utils/dynamicStoryLoader.ts
// Simple, build-time solution for dynamic story loading

interface StoryTemplate {
    id: string
    title: string
    theme: string
    stories: {
      simple: string
      regular: string
      challenge: string
    }
  }
  
  /**
   * Dynamic story loading utility
   * Works with Vite's build system by using import.meta.glob
   */
  export class DynamicStoryLoader {
    private static storyModules: Record<string, () => Promise<any>> | null = null
  
    /**
     * Initialize the story loader with all available story files
     * This uses Vite's import.meta.glob for build-time discovery
     */
    private static initializeStoryModules() {
      if (this.storyModules === null) {
        // Vite will resolve this at build time to include all matching files
        this.storyModules = import.meta.glob('/src/data/story-templates/*/*.json')
      }
      return this.storyModules
    }
  
    /**
     * Get all available story files for a given interest
     * @param interest - The interest category (e.g., 'animals', 'ocean')
     * @returns Array of story IDs available for this interest
     */
    static getAvailableStories(interest: string): string[] {
      const modules = this.initializeStoryModules()
      const storyIds: string[] = []
  
      // Extract story IDs from file paths that match the interest
      Object.keys(modules).forEach(path => {
        // Path format: /src/data/story-templates/animals/forest-rescue.json
        const pathMatch = path.match(`/src/data/story-templates/${interest}/(.+)\\.json$`)
        if (pathMatch) {
          storyIds.push(pathMatch[1]) // Extract filename without extension
        }
      })
  
      return storyIds.sort() // Return sorted for consistent ordering
    }
  
    /**
     * Load a specific story file
     * @param interest - Interest category
     * @param storyId - Story filename (without .json)
     * @returns Promise resolving to story template or null if not found
     */
    static async loadStory(interest: string, storyId: string): Promise<StoryTemplate | null> {
      const modules = this.initializeStoryModules()
      const targetPath = `/src/data/story-templates/${interest}/${storyId}.json`
      
      const loader = modules[targetPath]
      if (!loader) {
        console.warn(`Story not found: ${targetPath}`)
        return null
      }
  
      try {
        const module = await loader()
        return module.default as StoryTemplate
      } catch (error) {
        console.error(`Failed to load story: ${targetPath}`, error)
        return null
      }
    }
  
    /**
     * Get all interests that have stories available
     * @returns Array of interest categories with available stories
     */
    static getAvailableInterests(): string[] {
      const modules = this.initializeStoryModules()
      const interests = new Set<string>()
  
      Object.keys(modules).forEach(path => {
        const match = path.match(/\/src\/data\/story-templates\/([^\/]+)\//)
        if (match) {
          interests.add(match[1])
        }
      })
  
      return Array.from(interests).sort()
    }
  
    /**
     * Get a summary of all available stories organized by interest
     * Useful for debugging or admin interfaces
     */
    static async getAllStoriesSummary(): Promise<Record<string, StoryTemplate[]>> {
      const interests = this.getAvailableInterests()
      const summary: Record<string, StoryTemplate[]> = {}
  
      for (const interest of interests) {
        const storyIds = this.getAvailableStories(interest)
        const stories: StoryTemplate[] = []
  
        for (const storyId of storyIds) {
          const story = await this.loadStory(interest, storyId)
          if (story) {
            stories.push(story)
          }
        }
  
        summary[interest] = stories
      }
  
      return summary
    }
  }
  
  // Export convenience functions for backward compatibility
  export const getAvailableStories = (interest: string) => 
    DynamicStoryLoader.getAvailableStories(interest)
  
  export const loadStoryFile = (interest: string, storyId: string) => 
    DynamicStoryLoader.loadStory(interest, storyId)