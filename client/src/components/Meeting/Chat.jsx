import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import socket from '../../socket';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import validator from 'validator';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { BACKEND_URL } from '../../constants';
import UrlModal from './UrlModal';


const drawerWidth = 300;

export default function Chat({ roomId, open, thisUser }) {

  const [msg, setMsg] = useState([]);
  const inputRef = useRef();
  const [urlScanResult, setUrlScanResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  useEffect(() => {
    socket.on('FE-receiveMessage', ({ msg, sender }) => {
      setMsg((msgs) => [
        ...msgs,
        { sender, msg }
      ]);
    })
  }, []);

  const [modalOpen, setModalOpen] = useState(false);
  const handleClose = () => setModalOpen(false);

  const openUrlModal = async (url) => {
    setResultLoading(true);
    let res = await fetch(`${BACKEND_URL}/api/scanUrl`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: url,
      })
    });

    let response = await res.json();
    setResultLoading(false);

    if (response.success) {
      let trimmedDetails = JSON.stringify(response.data, null, 2);
      setUrlScanResult(trimmedDetails);
    } else {
      setUrlScanResult('Failed to scan URL! Please try again.');
    }
    setModalOpen(true);
  }


  async function sendMessage(e) {
    if (e.key === 'Enter') {
      const message = e.target.value;

      if (message) {
        socket.emit('BE-sendMessage', { roomId, msg: message, sender: thisUser });
        e.target.value = '';
        inputRef.current.value = '';
      }
    }
  };

  return (
    <>
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
        <Box sx={{
          width: '100%',
          overflowY: 'scroll',
          marginBottom: 8,
          "&::-webkit-scrollbar": {
            display: "none"
          }
        }}>
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
                      {sender === thisUser ? 'Me' : sender}
                    </Typography>
                    {validator.isURL(msg) ?
                      <>
                        <Link href={msg} >
                          {msg}
                        </Link>
                        <Tooltip title='Check for malicious URL'>
                          {
                            resultLoading ? <CircularProgress size={20} sx={{ float: 'right' }}/> : 
                          <TravelExploreRoundedIcon
                            onClick={() => openUrlModal(msg)}
                            sx={{
                              float: 'right',
                              cursor: 'pointer',
                            }} />
                          }
                        </Tooltip>
                      </>
                      : <Typography variant='p'>
                        {msg}
                      </Typography>
                    }
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

      {modalOpen && createPortal(
        <UrlModal
          open={modalOpen}
          handleClose={handleClose}
          urlScanResult={urlScanResult}/>,
        document.body
      )}
    </>
  )
}
