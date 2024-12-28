import React, { useState, useRef, useEffect } from 'react'
import { 
  Button, TextField, Typography, Box, CircularProgress, Card, 
  CardContent, Paper, Fade, Skeleton 
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

function ChatPage() {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleAsk = async () => {
    if (!question.trim()) return
    
    const newMessage = { type: 'question', content: question }
    setMessages(prev => [...prev, newMessage])
    setQuestion('')
    
    try {
      setLoading(true)
      const res = await fetch('/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question })
      })
      
      if (!res.ok) throw new Error('Failed to get response')
      
      const data = await res.json()
      setMessages(prev => [...prev, {
        type: 'answer',
        content: data.answer,
        chunks: data.relevantChunks
      }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, {
        type: 'error',
        content: 'Error: Failed to get response from server'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAsk()
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <Paper 
        sx={{ 
          flex: 1, 
          mb: 2, 
          p: 2, 
          overflowY: 'auto',
          backgroundColor: '#f5f5f5'
        }}
      >
        {messages.map((message, index) => (
          <Fade in={true} key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: message.type === 'question' ? 'flex-end' : 'flex-start',
                mb: 2
              }}
            >
              <Card
                sx={{
                  maxWidth: '70%',
                  backgroundColor: message.type === 'question' ? '#1976d2' : '#fff'
                }}
              >
                <CardContent>
                  <Typography color={message.type === 'question' ? 'white' : 'text.primary'}>
                    {message.content}
                  </Typography>
                  {message.chunks && (
                    <Box sx={{ mt: 1 }}>
                      {message.chunks.map((chunk, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2" 
                          color={message.type === 'answer' ? 'text.secondary' : 'text.primary'}
                          sx={{ mb: 0.5 }}
                        >
                          Source: {chunk.text}
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                            Confidence: {(chunk.confidence * 100).toFixed(2)}%
                          </Typography>
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {message.type === 'error' && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      {message.content}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="rectangular" width={300} height={60} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Paper>
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your question..."
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          disabled={loading}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleAsk}
          disabled={!question.trim() || loading}
          sx={{ minWidth: 100 }}
          endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}

export default ChatPage
