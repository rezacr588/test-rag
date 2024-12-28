import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Button, 
  ThemeProvider, 
  createTheme,
  Box 
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ChatPage from './Pages/ChatPage'
import UploadPage from './Pages/UploadPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function NavButton({ to, children, icon }) {
  const location = useLocation()
  const isActive = location.pathname === to
  
  return (
    <Button
      component={Link}
      to={to}
      color="inherit"
      sx={{
        mx: 1,
        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
        },
      }}
      startIcon={icon}
    >
      {children}
    </Button>
  )
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppBar position="static">
            <Toolbar>
              <NavButton to="/" icon={<ChatIcon />}>Chat</NavButton>
              <NavButton to="/upload" icon={<UploadFileIcon />}>Upload</NavButton>
            </Toolbar>
          </AppBar>
          <Container sx={{ flex: 1, py: 3 }}>
            <Routes>
              <Route path="/" element={<ChatPage />} />
              <Route path="/upload" element={<UploadPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App