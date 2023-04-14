import React, { useRef, useState } from 'react';
import jwt_decode from "jwt-decode";
import socket from '../socket';
import Navbar from './Navbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import VideoCameraFrontIcon from '@mui/icons-material/VideoCameraFront';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';


const theme = createTheme({
  palette: {
    background: {
      default: '#282c34',
    },
  },
});

export default function JoinMeet() {
  const navigate = useNavigate();

  const roomRef = useRef();
  const userRef = useRef();
  const [errMsg, setErrMsg] = useState('');


  function joinRoom() {
    const roomId = roomRef.current.value;
    const userName = userRef.current.value;

    const user = JSON.parse(localStorage.getItem('user'));
    if(user) {
      const decodedJwt = jwt_decode(user.token);
    }

    if (!roomId || !userName) {
      setErrMsg('Either room or userName is not defined');
      alert(`Something wrong: ${errMsg}`);
    } else {
      socket.emit('BE-isIPblocked', { userEmail: decodedJwt.email });
      socket.on('FE-errorIPblocked', ({ isIPblocked }) => {
        if (isIPblocked) {
          alert('Your IP has been blocked by the host!');
          return;
        }
        else {
          navigate('/setupRoom', {
            state: {
              isHost: false,
              userName: userName,
              roomId: roomId
            }
          });
        }
      })
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
              Join a Meet
            </Typography>
            <VideoCameraFrontIcon fontSize='large' />
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
                    required
                    fullWidth
                    name="roomId"
                    label="Room ID"
                    type="text"
                    id="roomref"
                    inputRef={roomRef}
                  />
                </Grid>
              </Grid>
              <Button
                onClick={joinRoom}
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Join
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/createMeet" variant="body2">
                    Create a New meeting
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider></>
  )
}
