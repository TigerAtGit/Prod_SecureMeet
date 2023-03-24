import React, { useEffect, useState, useRef } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { BACKEND_URL } from '../../constants';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: 5,
  boxShadow: 24,
  p: 2,
};

export default function UserModal({ open, handleClose, userInfo, userId, removeParticipant }) {

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
      // removeParticipant(userId, username);
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
        <Button variant="contained" color="secondary"
          sx={{
            marginTop: 2,
            marginRight: 2
          }}>
          Get IP details
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