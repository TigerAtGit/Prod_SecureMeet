import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ScreenShareRoundedIcon from '@mui/icons-material/ScreenShareRounded';
import StopScreenShareRoundedIcon from '@mui/icons-material/StopScreenShareRounded';

export default function BottomBar({
  roomId,
  username,
  userAV,
  toggleCamera,
  toggleAudio,
  leaveRoom,
  shareScreen,
  screenShareActive,
  openSettings,
  openChat,
  closeChat,
  chatopen,
  openParticipantsList,
  closeParticipantsList,
  participantsOpen
}) {
  return (
      <Stack direction="row" marginTop="70vh" position="absolute" spacing={1} sx={{
        backgroundColor: 'black',
        padding: 2,
        borderRadius: 2
      }}>
        <Box
          onClick={toggleCamera}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2,
          }}>
          {userAV.localUser.video ?
            <VideocamIcon sx={{ color: 'white' }} /> : <VideocamOffIcon sx={{ color: 'white' }} />}
        </Box>
        <Box
          onClick={toggleAudio}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2
          }}>
          {userAV.localUser.audio ?
            <MicIcon sx={{ color: 'white' }} /> : <MicOffIcon sx={{ color: 'white' }} />}
        </Box>
        <Box
          onClick={shareScreen}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2
          }}>
          {screenShareActive ? <StopScreenShareRoundedIcon sx={{ color: 'white' }} /> :
            <ScreenShareRoundedIcon sx={{ color: 'white' }} />
          }
        </Box>
        <Box
          onClick={leaveRoom}
          sx={{
            ':hover': { bgcolor: '#B00000' },
            backgroundColor: '#FF0000',
            display: 'flex',
            padding: 1,
            paddingX: 2,
            borderRadius: 2
          }}>
          <CallEndIcon sx={{ color: 'white' }} />
        </Box>
        <Box
          onClick={openSettings}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2
          }}>
          <SettingsIcon sx={{ color: 'white' }} />
        </Box>
        <Box
          onClick={() => {
            chatopen ? closeChat() : openChat()
          }}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2
          }}>
          {chatopen ? <ChatIcon sx={{ color: 'black' }} /> :
            <ChatIcon sx={{ color: 'white' }} />
          }
        </Box>
        <Box
          onClick={() => {
            participantsOpen ? closeParticipantsList() : openParticipantsList()
          }}
          sx={{
            ':hover': { bgcolor: '#5A5A5A' },
            backgroundColor: '#808080',
            display: 'flex',
            padding: 1,
            borderRadius: 2
          }}>
          {participantsOpen ? <PeopleAltIcon sx={{ color: 'black' }} /> :
            <PeopleAltIcon sx={{ color: 'white' }} />
          }
        </Box>
      </Stack>
  )
}
