'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/landing/navbar'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { AppBackground } from '@/components/layout/app-background'

const AI_MODELS = [
  { id: 'sonnet-4.5', name: 'Claude Sonnet 4.5' },
  { id: 'gpt-5.1', name: 'GPT-5.1' },
  { id: 'gemini-3.0', name: 'Gemini 3.0' }
]

function DashboardContent() {
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [installationId, setInstallationId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)

        // Fetch user's installation
        try {
          const response = await fetch('/api/installations/get')
          if (response.ok) {
            const { data: installation } = await response.json()
            if (installation?.installation_id) {
              setInstallationId(installation.installation_id.toString())
            }
          }
        } catch (error) {
          console.error('Failed to fetch installation:', error)
        }

        // Fetch bot configuration
        try {
          const response = await fetch('/api/bot-config')
          if (response.ok) {
            const { data: config } = await response.json()
            if (config && config.model_name) {
              const models = Array.isArray(config.model_name) 
                ? config.model_name 
                : JSON.parse(config.model_name)
              // Get the first model if array, or the model itself if string
              const firstModel = Array.isArray(models) ? models[0] : models
              if (firstModel) {
                setSelectedModel(firstModel)
              }
            }
          }
        } catch (error) {
          console.error('Failed to fetch bot config:', error)
        }
      }
      
      setLoading(false)
    }

    loadData()
  }, [searchParams])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isDropdownOpen && !target.closest('.dropdown-container')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    setSaveError(null)

    try {
      const response = await fetch('/api/bot-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model_names: selectedModel ? [selectedModel] : [],
          installation_id: installationId ? parseInt(installationId) : null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save configuration')
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to save bot config:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save configuration')
      setTimeout(() => setSaveError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId === '' ? null : modelId)
    setIsDropdownOpen(false)
  }

  if (loading) {
    return (
      <AppBackground>
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-3 rounded-full bg-gray-900/80 px-5 py-2 border border-gray-800 shadow-lg"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-400" />
            </span>
            <p className="text-sm text-gray-200">Loading your dashboard...</p>
          </motion.div>
        </div>
      </AppBackground>
    )
  }

  return (
    <AppBackground>
      <Navbar />
      
      <main className="pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <div className="mb-10">
              <motion.div
                className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 border border-indigo-500/30 text-xs font-medium text-indigo-300 mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    d="M12 3L4 9v12h16V9l-8-6z"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>AI Control Center</span>
              </motion.div>

              <motion.h1
                className="text-4xl font-bold tracking-tight text-gray-50 sm:text-5xl font-sans"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
              >
                Dashboard
              </motion.h1>

              <motion.p
                className="mt-4 text-lg leading-8 text-gray-400"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Configure the AI models your bot can use and fine-tune how Unvibe interacts with
                your codebase.
              </motion.p>

              <AnimatePresence>
                {user?.email && (
                  <motion.div
                    key="user-chip"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: 0.25 }}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-gray-900/80 px-3 py-1 border border-gray-800 text-xs text-gray-300"
                  >
                    <svg
                      className="h-3.5 w-3.5 text-emerald-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M5 12l4 4L19 6"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="font-medium">Logged in as</span>
                    <span className="text-gray-200">{user.email}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.div
              className="rounded-2xl border border-gray-800 bg-linear-to-b from-gray-950 via-gray-900 to-gray-950/80 p-8 shadow-[0_0_40px_rgba(15,23,42,0.8)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
            >
              <motion.div
                className="mb-6 flex items-start justify-between gap-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 text-white">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M12 3v18M5 7h9M5 12h9M5 17h9"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-100">
                        AI Model
                      </p>
                      <p className="text-xs text-gray-400">
                        Select which model your bot will use during analyses.
                      </p>
                    </div>
                  </div>
                </div>

                <motion.span
                  className="inline-flex items-center gap-1 rounded-full bg-gray-900/70 px-2.5 py-1 text-[10px] font-medium text-gray-400 border border-gray-800"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Single model selection
                </motion.span>
              </motion.div>

              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Choose the AI model that best fits your needs. Unvibe will use this model for all analyses.
                </p>

                <div className="relative mt-4 dropdown-container">
                  <motion.button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/80 border border-gray-800 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-500/60 transition-all"
                  >
                    <span className="flex items-center gap-2 text-sm text-gray-200">
                      <svg
                        className="h-4 w-4 text-indigo-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          d="M4 6h16M6 12h12M10 18h4"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {selectedModel ? (
                        (() => {
                          const model = AI_MODELS.find(m => m.id === selectedModel)
                          return model?.name || 'Select an AI model'
                        })()
                      ) : (
                        'Select an AI model'
                      )}
                    </span>
                    <motion.svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        key="models-dropdown"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute z-10 mt-2 w-full bg-gray-950 border border-gray-800 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
                      >
                        <div className="p-2">
                          {AI_MODELS.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => handleModelChange(model.id)}
                              className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition-colors ${
                                selectedModel === model.id
                                  ? 'bg-indigo-500/10 border border-indigo-500/40'
                                  : 'hover:bg-gray-900 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 border border-gray-800 text-xs text-gray-300">
                                  {model.name[0]}
                                </span>
                                <div className="text-left flex-1">
                                  <p className="text-sm font-medium text-gray-100">
                                    {model.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {model.id === 'sonnet-4.5' && 'Anthropic · great for long contexts'}
                                    {model.id === 'gpt-5.1' && 'OpenAI · balance between cost and quality'}
                                    {model.id === 'gemini-3.0' && 'Google · strong in multimodal context'}
                                  </p>
                                </div>
                              </div>
                              {selectedModel === model.id && (
                                <svg
                                  className="h-5 w-5 text-indigo-400"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {selectedModel && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-indigo-500/10 border border-indigo-500/40 rounded-lg"
                  >
                    {(() => {
                      const model = AI_MODELS.find(m => m.id === selectedModel)
                      return model ? (
                        <div className="flex items-start gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-indigo-500/20 border border-indigo-500/40 text-xs text-indigo-300">
                            {model.name[0]}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-100">
                              {model.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {model.id === 'sonnet-4.5' && 'Anthropic · great for long contexts'}
                              {model.id === 'gpt-5.1' && 'OpenAI · balance between cost and quality'}
                              {model.id === 'gemini-3.0' && 'Google · strong in multimodal context'}
                            </p>
                          </div>
                        </div>
                      ) : null
                    })()}
                  </motion.div>
                )}
              </div>


              <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-800">
                <div className="flex-1">
                  <AnimatePresence>
                    {saveSuccess && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center text-emerald-400"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Configuration saved successfully!</span>
                      </motion.div>
                    )}
                    {saveError && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center text-red-400"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-sm font-medium">{saveError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  onClick={handleSave}
                  disabled={saving || !selectedModel}
                  whileHover={{ scale: saving || !selectedModel ? 1 : 1.02 }}
                  whileTap={{ scale: saving || !selectedModel ? 1 : 0.98 }}
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Configuration'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </AppBackground>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}