/**
 * useSaveToProject — shared hook for saving module snapshots to projects
 *
 * localStorage schema:
 *   strux_projects: [ { id, name, createdAt, updatedAt, modules: { beam?, column?, slab?, foundation?, road?, bridge?, boq? } } ]
 */
import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'strux_projects'

export function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  } catch {}
}

export function useSaveToProject(moduleId, moduleData) {
  const [projects,     setProjects]     = useState(loadProjects)
  const [projectName,  setProjectName]  = useState('')
  const [toastMsg,     setToastMsg]     = useState(null)   // null | { text, type }
  const [isSaving,     setIsSaving]     = useState(false)

  // Keep projects in sync across hook instances
  useEffect(() => {
    const handler = () => setProjects(loadProjects())
    window.addEventListener('strux_projects_updated', handler)
    return () => window.removeEventListener('strux_projects_updated', handler)
  }, [])

  const showToast = useCallback((text, type = 'success') => {
    setToastMsg({ text, type })
    setTimeout(() => setToastMsg(null), 3200)
  }, [])

  const save = useCallback(() => {
    if (!projectName.trim()) {
      showToast('Please enter a project name first.', 'error')
      return
    }
    if (!moduleData) {
      showToast('No data to save yet — run a calculation first.', 'error')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      const all = loadProjects()
      const now = new Date().toISOString()

      // Find existing project with same name (case-insensitive)
      const idx = all.findIndex(p => p.name.toLowerCase() === projectName.trim().toLowerCase())

      const snapshot = {
        savedAt: now,
        data:    moduleData,
      }

      if (idx >= 0) {
        // Update existing project
        all[idx].modules    = { ...(all[idx].modules || {}), [moduleId]: snapshot }
        all[idx].updatedAt  = now
      } else {
        // Create new project
        all.unshift({
          id:        `proj_${Date.now()}`,
          name:      projectName.trim(),
          createdAt: now,
          updatedAt: now,
          modules:   { [moduleId]: snapshot },
        })
      }

      saveProjects(all)
      setProjects(all)
      window.dispatchEvent(new Event('strux_projects_updated'))
      setIsSaving(false)
      showToast(`Saved to "${projectName.trim()}" ✓`, 'success')
    }, 320)
  }, [moduleId, moduleData, projectName, showToast])

  // Sorted existing project names for autocomplete
  const existingNames = projects.map(p => p.name)

  return {
    projects,
    projectName,
    setProjectName,
    existingNames,
    save,
    isSaving,
    toastMsg,
  }
}