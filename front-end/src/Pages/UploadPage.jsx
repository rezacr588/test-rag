import React, { useState, useCallback } from 'react'
import { 
  Button, Typography, Box, CircularProgress, Paper,
  Alert, LinearProgress 
} from '@mui/material'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'

function UploadPage() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setFile(file)
      } else {
        setStatus('Please upload only PDF or text files')
      }
    }
  }, [])

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type === 'application/pdf' || file.type === 'text/plain') {
        setFile(file)
      } else {
        setStatus('Please upload only PDF or text files')
      }
    }
  }

  const handleUpload = async () => {
    try {
      setLoading(true)
      setStatus('Uploading...')
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/ingest', {
        method: 'POST',
        body: formData,
        
      })
      
      if (res.ok) {
        setStatus('File uploaded and processed successfully')
        setFile(null)
      } else {
        const errorText = await res.text()
        setStatus(`Upload failed: ${errorText}`)
      }
    } catch (error) {
      console.error(error)
      setStatus('An error occurred during upload')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Upload Documents
      </Typography>
      
      <Paper
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        sx={{
          p: 3,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: dragActive ? 'primary.main' : 'grey.300',
          backgroundColor: dragActive ? 'action.hover' : 'background.paper',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.txt"
          style={{ display: 'none' }}
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Drag and drop your file here or click to select
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Supported formats: PDF, TXT (Max size: 5MB)
          </Typography>
        </label>
      </Paper>

      {file && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>{file.name}</Typography>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              onClick={() => setFile(null)}
              disabled={loading}
            >
              Remove
            </Button>
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleUpload}
            disabled={loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
          </Button>
        </Box>
      )}

      {loading && <LinearProgress sx={{ mt: 2 }} />}
      
      {status && (
        <Alert 
          severity={status.includes('successfully') ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          {status}
        </Alert>
      )}
    </Box>
  )
}

export default UploadPage
