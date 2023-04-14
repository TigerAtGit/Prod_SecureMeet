import './App.css';
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Protected from './components/Authentication/Protected';
import Home from './components/Home';
import Signup from './components/Authentication/Signup';
import Verify from './components/Authentication/Verify';
import Login from './components/Authentication/Login';
import CreateMeet from './components/CreateMeet';
import JoinMeet from './components/JoinMeet';
import SetupRoom from './components/SetupRoom';
import MeetingRoom from './components/Meeting/MeetingRoom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/login" element={<Login />} />
        <Route exact path="/signup" element={<Signup />} />
        <Route exact path="/register" element={<Verify />} />
        <Route exact path="/createMeet" element={
          <Protected>
            <CreateMeet />
          </Protected>
        } />
        <Route exact path="/joinMeet" element={
          <Protected>
            <JoinMeet />
          </Protected>
        } />
        <Route exact path="/setupRoom" element={
          <Protected >
            <SetupRoom />
          </Protected>
        } />
        <Route exact path="/meetingRoom/:roomId" element={
          <Protected >
            <MeetingRoom />
          </Protected>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
