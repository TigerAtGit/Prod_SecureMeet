import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserModal from './UserModal';


const drawerWidth = 300;

export default function Participants({ isHost, participants, open }) {
  const users = participants;

  const [modalOpen, setModalOpen] = useState(false);
  const handleClose = () => setModalOpen(false);
  const [modalInfo, setModalInfo] = useState({});

  const openUserModal = (userInfo) => {
    setModalInfo(userInfo);
    setModalOpen(true);
  }

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
        <Typography variant='h5' textAlign={'center'} bgcolor={'darkgray'}>
          Participants
        </Typography>
        <Divider />
        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          {
            users && users.map(({ userId, info }) => {
              return (
                <ListItem key={userId} sx={{ marginBottom: 0.5, bgcolor: 'wheat' }}>
                  <ListItemAvatar>
                    <Tooltip title={info.userEmail}>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText primary={info.userName} />
                  {isHost && <MoreVertIcon
                    onClick={() => openUserModal(info)}
                    sx={{
                      ':hover': { bgcolor: 'ButtonFace' },
                      cursor: 'pointer'
                    }}
                  ></MoreVertIcon>
                  }
                </ListItem>
              )
            })
          }
        </List>
      </Drawer>
      {modalOpen && createPortal(
        <UserModal open={modalOpen} handleClose={handleClose} userInfo={modalInfo} />,
        document.body
      )}
    </>
  )
}
