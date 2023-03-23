import React, { useEffect, useState, useRef } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

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

export default function UserModal({ open, handleClose, userInfo }) {

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
          <Divider/>
          <b>Email:</b> {userInfo.userEmail}
          <Divider/>
          <b>IP address:</b> {userInfo.ipAddr}
        </div>
      </Box>
    </Modal>
  )
}