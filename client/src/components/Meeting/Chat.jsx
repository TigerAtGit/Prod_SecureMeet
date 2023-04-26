import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import socket from '../../socket';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { Button, InputAdornment } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import validator from 'validator';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import TravelExploreRoundedIcon from '@mui/icons-material/TravelExploreRounded';
import CircularProgress from '@mui/material/CircularProgress';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { BACKEND_URL } from '../../constants';
import UrlModal from './UrlModal';
// import { FLASK_URL } from '../../constants';


const drawerWidth = 300;

export default function Chat({ roomId, open, thisUser }) {

  const [msg, setMsg] = useState([]);
  const inputRef = useRef();
  const [urlScanResult, setUrlScanResult] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState(null);
  const inputFile = useRef();

  useEffect(() => {
    socket.on('FE-receiveMessage', ({ msg, sender }) => {
      const isFile = false;
      setMsg((msgs) => [
        ...msgs,
        { sender, msg, isFile }
      ]);
    });

    socket.on('FE-receiveFile', ({ name, url, sender }) => {
      const isFile = true;
      const msg = `${BACKEND_URL}/uploads/${url}`;
      setMsg((msgs) => [
        ...msgs,
        { sender, msg, isFile, name }
      ]);
    });

    socket.on('FE-sendFileError', () => {
      alert('Unable to send file!');
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

  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setFileName(file.name);
      setUploadedFile(file);
    }
  };

  const sendFile = () => {
    const reader = new FileReader();
    const fileSizeMb = uploadedFile.size / (1024 * 1024);
    reader.onload = (e) => {
      const fileData = {
        name: uploadedFile.name,
        type: uploadedFile.type,
        size: uploadedFile.size,
        data: reader.result
      }
      if(fileSizeMb >= 100) {
        alert('File size must be less than 100 mb!');
        setFileName(null);
        return;
      }
      socket.emit('BE-sendFile', { roomId, fileData, sender: thisUser });
      setFileName(null);
    };
    reader.readAsArrayBuffer(uploadedFile);
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
              msg.map(({ sender, msg, isFile, name }, idx) => {
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

                    {isFile ?
                      <>
                        <a href={msg} target='_blank' rel='noreferrer' download={name}>
                          <DescriptionRoundedIcon sx={{
                            color: 'secondary',
                            fontSize: 40
                          }} />
                        </a><br />
                        <Typography variant='p' sx={{
                          fontSize: 12,
                          fontWeight: '600'
                        }}>
                          {name}
                        </Typography>
                      </>
                      : validator.isURL(msg) ?
                        <>
                          <Link href={msg} >
                            {msg}
                          </Link>
                          <Tooltip title='Check for malicious URL'>
                            {
                              resultLoading ? <CircularProgress size={20} sx={{ float: 'right' }} /> :
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

        {fileName &&
          <Box
            component="span"
            sx={{
              border: '1px dashed grey',
              position: 'absolute',
              paddingX: 1,
              bottom: 60,
              fontSize: 14
            }}>
            {fileName}
            <Button onClick={sendFile}>Send</Button>
            <ClearRoundedIcon onClick={() => {
              setFileName(null);
            }} sx={{
              fontSize: 20,
              cursor: 'pointer',
            }}/>
          </Box>
        }

        <TextField id="outlined-basic" variant="outlined"
          placeholder='Type your message'
          onKeyUp={sendMessage}
          ref={inputRef}
          fullWidth
          sx={{
            position: 'absolute',
            bottom: 0,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => inputFile.current.click()} >
                  <AttachFileIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <input type="file" id="fileInput" hidden ref={inputFile} onChange={handleFileChange} />
      </Drawer>

      {modalOpen && createPortal(
        <UrlModal
          open={modalOpen}
          handleClose={handleClose}
          urlScanResult={urlScanResult} />,
        document.body
      )}
    </>
  )
}
