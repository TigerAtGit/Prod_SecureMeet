import React, { useEffect, useState, useRef } from 'react';
import socket from '../../socket';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';


const drawerWidth = 300;

export default function Chat({ display, roomId, clickChat, open }) {
  const currentUser = localStorage.getItem('userName');
  const [msg, setMsg] = useState([]);
  const inputRef = useRef();

  useEffect(() => {
    socket.on('FE-receiveMessage', ({ msg, sender }) => {
      setMsg((msgs) => [
        ...msgs,
        { sender, msg }
      ]);
    })
  }, []);

  function sendMessage(e) {
    if (e.key === 'Enter') {
      const message = e.target.value;

      if (message) {
        socket.emit('BE-sendMessage', { roomId, msg: message, sender: currentUser });
        e.target.value = '';
        inputRef.current.value = '';
      }
    }
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
        },
      }}
      variant="persistent"
      anchor="right"
      open={open}
    >
      <Typography variant='h5' textAlign={'center'}>
        Chat Section
      </Typography>
      <Divider />
      <Box sx={{ width: '100%' }}>
        <Stack>
          {msg &&
            msg.map(({ sender, msg }, idx) => {
              return (
                <Box
                  key={idx}
                  sx={{
                    width: '80%',
                    padding: 1,
                    marginTop: 1,
                    marginLeft: 1,
                    backgroundColor: '#D3D3D3',
                    borderRadius: 2,
                  }}>
                  <Typography variant='p' fontWeight={'600'} display={'block'}>
                    {sender === currentUser ? 'Me': sender}
                  </Typography>
                  <Typography variant='p'>
                    {msg}
                  </Typography>
                </Box>
              )
            })
          }
        </Stack>
      </Box>
      <TextField id="outlined-basic" variant="outlined"
        placeholder='Type your message'
        onKeyUp={sendMessage}
        ref={inputRef}
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }} />
    </Drawer>
  )
}
