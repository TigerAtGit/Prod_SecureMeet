import React, { useRef, useState, useEffect } from 'react';
// import socket from '../socket';
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
  const [err, setErr] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  // useEffect(() => {
  //   socket.on('FE-errorUserExists', ({ error }) => {
  //     if (!error) {
  //       const roomId = roomRef.current?.value;
  //       const userName = userRef.current?.value;

  //       if (!userName || !roomId) return;

  //       localStorage.setItem('userName', userName);
  //       localStorage.setItem('roomId', roomId);
  //       // props.history.push(`/setupRoom`);
  //       navigate('/setupRoom');
  //     } else {
  //       setErr(error);
  //       setErrMsg('User already exists.');
  //       console.log(`Some error occurred: ${errMsg}`);
  //     }
  //   });
  // }, [props.history]);


  function joinRoom() {
    const roomId = roomRef.current.value;
    const userName = userRef.current.value;

    if (!roomId || !userName) {
      setErr(true);
      setErrMsg('Either room or userName is not defined');
      alert(`Something wrong: ${errMsg}`);
    } else {
      // socket.emit('BE-checkUser', { roomId: roomId, userName: userName });
      // socket.on('FE-errorUserExists', ({ error }) => {
      //   if (!error) {
          const roomId = roomRef.current?.value;
          const userName = userRef.current?.value;
  
          if (!userName || !roomId) return;
  
          // localStorage.setItem('userName', userName);
          // localStorage.setItem('roomId', roomId);
          navigate('/setupRoom', {
            state: {
              isHost: false,
              userName: userName,
              roomId: roomId
            }
          });
    //     } else {
    //       setErr(error);
    //       setErrMsg('User already exists.');
    //       console.log(`Some error occurred: ${errMsg}`);
    //     }
    //   });
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

/* Changed export method */
