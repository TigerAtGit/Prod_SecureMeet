import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import ContactMailRoundedIcon from '@mui/icons-material/ContactMailRounded';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
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
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const handleChange = (e) => {
    setInputEmail(e.target.value);
  }

  const sendOtp = async (e) => {

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(inputEmail)) {
      alert('Please enter a valid email');
      return;
    }

    setOtpLoading(true);

    let check = await fetch(`${BACKEND_URL}/api/checkEmail`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail
      })
    });

    if (check.status === 200) {
      let response = await check.json();
      if (response.emailExists) {
        alert('Email already registered');
        setOtpLoading(false);
      }
      else {
        let res = await fetch(`${BACKEND_URL}/api/sendOtp`, {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: inputEmail
          })
        });

        let response = await res.json();
        setOtpLoading(false);

        if (response.success) {
          alert('Code sent successfully');
          setCodeDisabled(false);
        } else {
          alert('Error while sending code!');
        }
      }
    } else {
      alert('Failed to connect to server. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleVerify = async (e) => {
    const data = new FormData(e.currentTarget);
    const vcode = data.get('vcode');

    e.preventDefault();

    if (codeDisabled) {
      alert('Please first generate the code!');
      return;
    }
    setVerifyLoading(true);

    let res = await fetch(`${BACKEND_URL}/api/confirmOtp`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: inputEmail,
        userEnteredOtp: vcode
      })
    });

    setVerifyLoading(false);

    if (res.status === 200) {
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
              Kindly Verify your Email first
            </Typography>
            <Box component="form" onSubmit={handleVerify} sx={{ mt: 3 }}>
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
                    Send OTP
                    {otpLoading && <CircularProgress size={20} sx={{ marginLeft: 1 }} />}
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
                {verifyLoading ? <CircularProgress size={30} sx={{ color: 'white' }} /> : <>Verify</>}
              </Button>
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Typography
                  fontSize={12}>
                    *Haven't received OTP yet? Click on send OTP again.
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  )
}