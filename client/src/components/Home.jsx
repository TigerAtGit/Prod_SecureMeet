import '../App.css';
import React from 'react';
import Navbar from './Navbar';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

export default function Home() {
  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <h2 style={{maxWidth: "50vw"}}>SecureMeet - A Meeting platform with IP Blocking and Profanity Detection</h2>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
          <Button color='secondary' href='/createMeet'>Create Meet</Button>
          <Button color='success' href='/joinMeet'>Join a Meet</Button>
        </ButtonGroup>
      </header>
    </div>
  );
}
