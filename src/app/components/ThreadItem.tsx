/* eslint-disable @next/next/no-img-element */
import { PayloadType } from "@/interfaces/sse"
import { memo } from "react"

type Props = {
  clientId: string
  data: PayloadType
}

const ThreadItem: React.FC<Props> = ({ clientId, data }) => {
  return (
    <>
      {data.type === 'message' && (
        <div className={`w-full flex gap-1.5 ${data.clientId === clientId ? 'justify-end pl-10' : 'justify-start pr-10'}`}>
          {data.clientId !== clientId && (
            <img
              src={`https://ui-avatars.com/api/?format=svg&rounded=true&name=${encodeURI(data.userName)}`}
              alt={`${data.userName}'s avatar`}
              className='w-7 h-7 rounded-full object-cover self-end'
            />
          )}
          <div className={`text-white rounded-xl w-auto px-2.5 py-1 space-y-0.5 ${data.clientId === clientId ? 'bg-blue-700 rounded-br-none' : 'bg-blue-500 rounded-bl-none'}`}>
            {data.clientId !== clientId && (
              <div className='text-[9px]'>{data.userName}</div>
            )}
            <p className='whitespace-pre-wrap'>{data.message}</p>
            <div className='text-[9px]'>
              {new Intl.DateTimeFormat('en', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
              }).format(new Date(data.timestamp))}
            </div>
          </div>
        </div>
      )}
      {data.type === 'connected' && (
        <div className='w-full bg-blue-800 px-3 py-1 rounded-md text-center text-xs'>
          {data.clientId === clientId ? 'You are joined' : `${data.userName} is joined`}
        </div>
      )}
      {data.type === 'disconnected' && (
        <div className='w-full bg-blue-800 px-3 py-1 rounded-md text-center text-xs'>
          {data.clientId === clientId ? 'You are left' : `${data.userName} is left`}
        </div>
      )}
    </> 
  )
}

export default memo(ThreadItem)
