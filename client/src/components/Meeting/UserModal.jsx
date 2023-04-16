import { useState } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { BACKEND_URL } from '../../constants';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  maxHeight: 500,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: 5,
  boxShadow: 24,
  p: 2,
};

export default function UserModal({ open, handleClose, userInfo, userId, removeParticipant }) {

  const [ipInfoLoading, setIpInfoLoading] = useState(false);
  const [ipInfoValue, setIpInfoValue] = useState(null);
  
  const getIpDetails = async (ipAddr) => {
    setIpInfoLoading(true);
    
    let res = await fetch(`${BACKEND_URL}/api/ipInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ipAddr: ipAddr,
      })
    });

    let response = await res.json();
    setIpInfoLoading(false);

    if (response.success) {
      let trimmedDetails = JSON.stringify(response.data, null, 2);
      try {
        let formattedIpInfo = '';
        const parsedJson = JSON.parse(trimmedDetails);
        for (const [name, value] of Object.entries(parsedJson)) {
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
          formattedIpInfo += `${formattedName}: ${value}\n`;
        }
        setIpInfoValue(formattedIpInfo.trim());
      } catch {
        setIpInfoValue('Failed to get IP details! Please try again.');
      }
    } else {
      alert('Failed to get IP details! Please try again.');
    }

  }

  const requestIpBlock = async (userEmail, ipAddr, username) => {

    let res = await fetch(`${BACKEND_URL}/api/blockIP`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userEmail: userEmail,
        ipAddr: ipAddr,
      })
    });

    let response = await res.json();

    if (response.success) {
      alert(`IP address blocked`);
      removeParticipant(userId, username);
    } else {
      alert('Operation failed! Please try again.');
    }

  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2"
          sx={{ fontWeight: 'bold', marginBottom: 2 }}>
          User Information
        </Typography>
        <div id="modal-modal-description" sx={{ mt: 2 }}>
          <b>Name:</b> {userInfo.userFullName}
          <Divider />
          <b>Email:</b> {userInfo.userEmail}
          <Divider />
          <b>IP address:</b> {userInfo.ipAddr}
        </div>

        {ipInfoValue &&
          <TextField fullWidth multiline rows={4} value={ipInfoValue} />
        }

        <Button variant="contained" color="secondary"
          onClick={() => getIpDetails(userInfo.ipAddr)}
          sx={{
            marginTop: 2,
            marginRight: 2
          }}>
          {ipInfoLoading && <CircularProgress size={20} sx={{ position: 'absolute', zIndex: 1 }} />}
          <span
            style={{
              opacity: ipInfoLoading ? 0.5 : 1,
            }}
          >
            Get IP details
          </span>
        </Button>

        <Button variant="contained" color="error"
          onClick={() => requestIpBlock(userInfo.userEmail, userInfo.ipAddr, userInfo.userName)}
          sx={{
            marginTop: 2,
          }}>
          Block IP
        </Button>

      </Box>
    </Modal>
  )
}