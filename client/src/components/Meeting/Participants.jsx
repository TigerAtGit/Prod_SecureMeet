import React, { useEffect, useState, useRef } from 'react';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';


const drawerWidth = 300;

export default function Participants({ participants, open }) {

  const users = participants;

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
                <MenuRoundedIcon />
              </ListItem>
            )
          })
        }
      </List>
    </Drawer>
  )
}
