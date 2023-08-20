'use client'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { PayloadType } from '@/interfaces/sse'
import '../app/globals.css'
import ThreadItem from './components/ThreadItem'

const baseAPI = 'http://localhost:8080/api'

const SSEPage: React.FC = () => {
  const refSSE = useRef<EventSource | null>(null)
  const [initializing, setInitializing] = useState<boolean>(false)
  const [clientId, setClientId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [message, setMessage] = useState<string>('')
  const [threads, setThreads] = useState<PayloadType[]>([])

  useEffect(() => {
    const terminateSSE = () => refSSE.current?.close()
    window.addEventListener('beforeunload', terminateSSE)
    return () => {
      terminateSSE()
      window.removeEventListener('beforeunload', terminateSSE)
    }
  }, [])

  const onInitClient = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (initializing) return
      if (!userName.trim()) return
      
      setInitializing(true)
      const sse = new EventSource(
        `${baseAPI}/sse-connect?name=${encodeURI(userName.trim())}`,
        { withCredentials: true }
      )
      
      sse.onerror = () => {
        setInitializing(false)
        sse.close()
      }

      sse.addEventListener('init', (e) => {
        const meta = JSON.parse(e.data) as PayloadType
        setClientId(meta.clientId)
        setInitializing(false)
        setUserName('')
      })

      sse.addEventListener('connected', (e) => {
        const meta = JSON.parse(e.data) as PayloadType
        setThreads(current => [...current, {
          ...meta,
          type: 'connected'
        }])
      })

      sse.addEventListener('message', (e) => {
        const meta = JSON.parse(e.data) as PayloadType
        setThreads(current => [...current, {
          ...meta,
          type: 'message'
        }])
      })

      sse.addEventListener('disconnected', (e) => {
        const meta = JSON.parse(e.data) as PayloadType
        setThreads(current => [...current, {
          ...meta,
          type: 'disconnected'
        }])
      })

      refSSE.current = sse
    },
    [userName, initializing]
  )

  const onSendMessage = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!message.trim()) return
      await fetch(baseAPI + '/sse-broadcast', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({message: message.trim()}),
        credentials: 'include'
      })
      setMessage('')
    },
    [message]
  )

  return (
    <div className="flex justify-center">
      <div className='w-full max-w-[32rem] md:max-w-sm bg-blue-950 h-screen space-y-3'>
        {initializing && (
          <div className='w-full p-3 rounded-md text-center text-xs'>
            Initializing...
          </div>
        )}
        {clientId ? (
          <form 
            onSubmit={onSendMessage}
            className="flex flex-col gap-2 h-full"
          >
            <div className='w-full grow p-2.5 space-y-3 max-h-[90vh] overflow-y-auto'>
              {threads.map((thread) => 
                <ThreadItem 
                  key={thread.uuid}
                  data={thread}
                  clientId={clientId}
                />
              )}
            </div>
            <div className='flex-none p-3 flex gap-3 items-start'>
              <textarea
                rows={2}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className='w-full p-2 resize-none rounded-md text-black'
              />
              <button 
                type="submit"
                className='px-2.5 py-1 bg-blue-500 rounded-md'
              >
                Send
              </button>
            </div>
          </form>
        ) : (
          <form 
            onSubmit={onInitClient}
            className="flex flex-col gap-3 p-3 h-full"
          >
            <div className='w-full m-auto space-y-2'>
              <input
                value={userName}
                required
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name..."
                className='w-full p-2 resize-none rounded-md text-black'
              />
              <button 
                type="submit"
                className='px-2.5 py-1 bg-blue-500 rounded-md w-full disabled:opacity-60'
                disabled={initializing}
              >
                Go
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default SSEPage
