'use client'

import { useChat } from 'ai/react'
import { useState, useEffect, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from '@/components/ui/use-toast'
import { Trash2, RotateCcw } from 'lucide-react'

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat()
  const [isTyping, setIsTyping] = useState(false)
  const [conversations, setConversations] = useState<Record<string, string>>({})
  const { toast } = useToast()

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const data = await response.json()
        setConversations(data)
      } else {
        throw new Error('Failed to fetch conversations')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation history'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchConversations()
    document.cookie = `token=${process.env.NEXT_PUBLIC_AUTH_TOKEN}; path=/;`
  }, [fetchConversations])

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsTyping(true)
    try {
      await handleSubmit(e)
      await fetchConversations()
    } finally {
      setIsTyping(false)
    }
  }

  const clearHistory = async () => {
    try {
      const response = await fetch('/api/conversations/clear', { method: 'POST' })
      if (response.ok) {
        setMessages([])
        setConversations({})
        toast({
          title: "Success",
          description: "Chat history has been cleared.",
        })
      } else {
        throw new Error('Failed to clear history')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear chat history'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  const loadConversation = (conversationId: string) => {
    try {
      const loadedMessages = JSON.parse(conversations[conversationId])
      setMessages(loadedMessages)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load conversation'
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-4xl mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI Chat Assistant</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={clearHistory}
              title="Clear history"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={fetchConversations}
              title="Refresh conversations"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto flex">
          <div className="w-1/4 border-r pr-4 overflow-y-auto">
            <h3 className="font-semibold mb-2">History</h3>
            {Object.entries(conversations)
              .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
              .map(([id]) => (
                <Button
                  key={id}
                  variant="ghost"
                  className="w-full justify-start mb-2 text-sm"
                  onClick={() => loadConversation(id)}
                >
                  {new Date(parseInt(id)).toLocaleString()}
                </Button>
              ))}
          </div>
          <div className="w-3/4 pl-4">
            {messages.map(m => (
              <div 
                key={m.id} 
                className={`mb-4 ${m.role === 'user' ? 'text-right' : 'text-left'}`}
              >
                <span 
                  className={`inline-block p-2 rounded-lg ${
                    m.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-black'
                  }`}
                >
                  {m.content}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="text-left">
                <span className="inline-block p-2 rounded-lg bg-gray-200 text-black">
                  AI is typing...
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <form onSubmit={onSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isTyping}>Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}