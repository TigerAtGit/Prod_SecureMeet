import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ContactMailRoundedIcon from '@mui/icons-material/ContactMailRounded';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BACKEND_URL } from '../../constants';


const theme = createTheme({
  palette: {
    background: {
      default: '#282c34',
    },
  },
});


export default function Verify() {
  const navigate = useNavigate();

  const [codeDisabled, setCodeDisabled] = useState(true);
  const [inputEmail, setInputEmail] = useState('');
  const [verCode, setVerCode] = useState('');

  const handleChange = (e) => {
    setInputEmail(e.target.value);
  }

  const sendOtp = async (e) => {

    if(inputEmail === undefined || inputEmail === '') {
      alert('Please enter a valid email');
      return;
    }

    let res = await fetch(`${BACKEND_URL}/api/sendmail`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail
      })
    });

    let response = await res.json();

    if (response.success) {
      alert('Code sent successfully');
      setCodeDisabled(false);
      setVerCode(response.verCode);
    } else {
      alert('Error while sending code!');
    }

  };

  const handleSubmit = async (e) => {
    const data = new FormData(e.currentTarget);
    const vcode = data.get('vcode');

    e.preventDefault();

    if (verCode === undefined || verCode === '') {
      alert('Please first generate the code!');
      return;
    }

    if (verCode === vcode) {
      alert('Verification successful.')
      e.target.reset();
      setTimeout(() => {
        navigate('/signup', {
          state: {
            userEmail: data.get('email')
          }
        });
      }, 500);
    } else {
      alert('Wrong code. Verification failed!');
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
              paddingBottom: 5,
              borderRadius: 5,
            }}
          >
            <ContactMailRoundedIcon sx={{ fontSize: 50 }} />
            <Typography component="h1" variant="h5">
              Kindly verify your Email first
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type='email'
                    id="email"
                    label="Email address"
                    name="email"
                    onChange={handleChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    onClick={sendOtp}
                    variant="outlined"
                    sx={{ float: 'right' }}
                  >
                    Send Verification code
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    disabled={codeDisabled}
                    required
                    fullWidth
                    type='number'
                    id="vcode"
                    label="Verification Code"
                    name="vcode"
                  />
                </Grid>
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color='success'
                sx={{ mt: 3, mb: 2 }}
              >
                Verify
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Link href="/" variant="body2">
                    Haven't recieved verfication code?
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  )
}