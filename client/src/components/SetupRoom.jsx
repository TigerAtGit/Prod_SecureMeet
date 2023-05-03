import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/system/Container';
import { CssBaseline } from '@mui/material';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SettingsIcon from '@mui/icons-material/Settings';
import { deepPurple } from '@mui/material/colors';


const theme = createTheme({
  palette: {
    background: {
      default: '#282c34',
    },
  },
});

export default function SetupRoom() {
  const navigate = useNavigate();

  const { state } = useLocation();
  const { isHost, userName, userEmail, roomId } = state;
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);

  function joinMeet() {
    navigate(`/meetingRoom/${roomId}`, {
      state: {
        isHost: isHost,
        userName: userName,
        userEmail: userEmail,
        audioEnabled: audioEnabled,
        videoEnabled: videoEnabled
      }
    });
  }

  return (
    <>
      <Navbar />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="s"
          sx={{
            marginTop: '20vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <CssBaseline />
          <Typography variant="h4" color='white'>
            Room Setup
          </Typography>
          <Typography variant="h5" color='white'>
            Setup your audio and video before joining
          </Typography>
          <Box
            sx={{
              marginTop: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 2,
              paddingBottom: 3,
              borderRadius: 3,
              width: '30vw'
            }}
          >
            <Avatar
              sx={{
                bgcolor: deepPurple[500],
                width: 60, height: 60, 
                color: 'white', fontWeight: '700', fontSize: 25 
              }}>
              {userName[0]}
            </Avatar>
            <Typography variant="h6" sx={{
              marginTop: 2,
            }}>
              {userName.toUpperCase()}
            </Typography>
            <Typography variant="p" sx={{
              marginTop: 1,
            }}>
              <b>Meeting ID: {roomId}</b>
            </Typography>
            <Stack direction="row" marginTop="7vh" spacing={1}>
              <Box
                onClick={() => setVideoEnabled(!videoEnabled)}
                sx={{
                  backgroundColor: '#282c34',
                  display: 'flex',
                  padding: 1,
                  borderRadius: 2,
                }}>
                {videoEnabled ?
                  <VideocamIcon sx={{ color: 'white' }} /> : <VideocamOffIcon sx={{ color: 'white' }} />}
              </Box>
              <Box
                onClick={() => setAudioEnabled(!audioEnabled)}
                sx={{
                  backgroundColor: '#282c34',
                  display: 'flex',
                  padding: 1,
                  borderRadius: 2
                }}>
                {audioEnabled ?
                  <MicIcon sx={{ color: 'white' }} /> : <MicOffIcon sx={{ color: 'white' }} />}
              </Box>
              <Box sx={{
                backgroundColor: '#282c34',
                display: 'flex',
                padding: 1,
                borderRadius: 2
              }}>
                <SettingsIcon sx={{ color: 'white' }} />
              </Box>
            </Stack>
          </Box>
          <Button
            onClick={joinMeet}
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
          >
            Join Meet
          </Button>
        </Container>
      </ThemeProvider>
    </>
  )
}
