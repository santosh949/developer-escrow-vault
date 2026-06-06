import { useEffect } from 'react'
import { Sidebar } from '../components/Sidebar'
import { EditorView } from '../components/EditorView'
import { WidgetsPanel } from '../components/WidgetsPanel'
import { TerminalLog } from '../components/TerminalLog'
import NeuralField from '../components/NeuralField'
import { useVaultStore } from '../store'
import { useNavigate } from 'react-router-dom'

export function Dashboard() {
  const { isUnlocked, tickTimer } = useVaultStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isUnlocked) {
      navigate('/')
    }
  }, [isUnlocked, navigate])

  // Global Timer Tick
  useEffect(() => {
    if (!isUnlocked) return
    const interval = setInterval(() => {
      tickTimer(1000) // Tick 1 second
    }, 1000)
    return () => clearInterval(interval)
  }, [isUnlocked, tickTimer])

  if (!isUnlocked) return null

  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden font-sans text-text">
      <NeuralField />
      
      <div className="flex w-full h-full relative z-10">
        <Sidebar />
        <EditorView />
        <WidgetsPanel />
      </div>
      <TerminalLog />
    </div>
  )
}
