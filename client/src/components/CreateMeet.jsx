import React, { useRef, useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import Navbar from './Navbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { useNavigate } from 'react-router-dom';


const theme = createTheme({
  palette: {
    background: {
      default: '#282c34',
    },
  },
});

export default function CreateMeet() {
  const navigate = useNavigate();

  const roomRef = useRef();
  const userRef = useRef();
  const [roomLabel, setRoomLabel] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    if (user) {
      const decodedJwt = jwt_decode(user.token);
      setUserEmail(decodedJwt.email)
    }
  })

  function generateRoomId() {
    const min = 111, max = 999;
    const rand = 'rid-' + (Math.floor(Math.random() * (max - min)) + min).toString();
    setRoomLabel(rand);
  }

  function createRoom() {
    const roomId = roomRef.current.value;
    const userName = userRef.current.value;

    if (!roomId || !userName) {
      alert(`Something went wrong!`);
    } else {
      navigate('/setupRoom', {
        state: {
          isHost: true,
          userName: userName,
          userEmail: userEmail,
          roomId: roomId
        }
      });
    }
  }

  return (
    <>
      <Navbar />
      <ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 12,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#fff',
              padding: 2,
              paddingBottom: 3,
              borderRadius: 5,
            }}
          >
            <Typography component="h1" variant="h5">
              Create a Meet
            </Typography>
            <VideoCallIcon fontSize='large' />
            <Box component="form" noValidate sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    name="userName"
                    label="Username"
                    type="text"
                    id="userName"
                    inputRef={userRef}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    disabled
                    value={roomLabel}
                    type="text"
                    id="roomref"
                    inputRef={roomRef}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CopyToClipboard text={roomLabel}>
                    <Button variant='contained' color='primary' fullWidth startIcon={<ContentCopyIcon fontSize='large' />}>
                      Copy your ID
                    </Button>
                  </CopyToClipboard>
                </Grid>
              </Grid>
              <Button
                onClick={generateRoomId}
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Generate meeting ID
              </Button>
              <Button
                onClick={createRoom}
                fullWidth
                variant="contained"
                color="success"
                sx={{ mt: 3, mb: 2 }}
              >
                Create
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/joinMeet" variant="body2">
                    Join an existing meeting
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider></>
  )
}

/* Removed unnecessary props */