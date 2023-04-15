import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Peer from 'simple-peer';
import socket from '../../socket';
import BottomBar from './BottomBar';
import VideoCard from './VideoCard';
import Chat from './Chat';
import Participants from './Participants';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from '@mui/system/Container';
import { CssBaseline } from '@mui/material';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/system';
import Typography from '@mui/material/Typography';


const theme = createTheme({
  palette: {
    background: {
      default: '#282c34',
    },
  },
});

const DisplayName = styled('div')({
  background: '#454545',
  color: '#FFFFFF',
  position: 'absolute',
  borderTopRightRadius: 5,
  padding: 5,
  marginBottom: 8,
  marginLeft: 3,
  fontSize: 20,
  zIndex: 1,
  bottom: 0
});


export default function MeetingRoom() {

  const handleChatOpen = () => {
    setParticipantsOpen(false);
    setChatOpen(true);
  };

  const handleChatClose = () => {
    setChatOpen(false);
  };

  const handleParticipantsOpen = () => {
    getParticipantsList();
    setChatOpen(false);
    setParticipantsOpen(true);
  };

  const handleParticipantsClose = () => {
    setParticipantsOpen(false);
  };

  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [screenShare, setScreenShare] = useState(false);

  const { roomId } = useParams();
  const { state } = useLocation();
  const { isHost, userName, userEmail } = state;
  const currentUser = userName; //localStorage.getItem('userName');
  const userFullName = JSON.parse(localStorage.getItem('user')).name;

  const [peers, setPeers] = useState([]);
  const [userAV, setUserAV] = useState({
    localUser: {
      video: localStorage.getItem('video') === 'true' ? true : false,
      audio: localStorage.getItem('audio') === 'true' ? true : false,
    },
  });

  const peersRef = useRef([]);
  const userVideoRef = useRef();
  const screenTrackRef = useRef();
  const userStream = useRef();

  useEffect(() => {
    // connect camera and mic 
    navigator.mediaDevices.getUserMedia({
      video: true, audio: true
    }).then((stream) => {

      userVideoRef.current.srcObject = stream;
      userVideoRef.current.srcObject
        .getVideoTracks()[0].enabled = userAV.localUser.video;
      userVideoRef.current.srcObject
        .getAudioTracks()[0].enabled = userAV.localUser.audio;
      userStream.current = stream;

      isHost ? socket.emit('BE-createRoom', {
        roomId: roomId,
        userName: currentUser,
        userFullName: userFullName,
        userEmail: userEmail,
        video: userAV.localUser.video,
        audio: userAV.localUser.audio
      }) :
        socket.emit('BE-joinRoom', {
          roomId: roomId,
          userName: currentUser,
          userFullName: userFullName,
          userEmail: userEmail,
          video: userAV.localUser.video,
          audio: userAV.localUser.audio
        });

      socket.on('FE-userJoin', (users) => {
        const peerList = [];
        users.forEach(({ userId, info }) => {
          let { userName, video, audio } = info;
          if (userId !== socket.id) {
            const peer = createPeer(userId, socket.id, stream);
            peer.userName = userName;
            peer.peerId = userId;

            peersRef.current.push({
              peerId: userId,
              peer,
              userName
            });
            peerList.push(peer);

            setUserAV((preList) => {
              return {
                ...preList,
                [peer.userName]: { video, audio },
              };
            });
          }
        });

        setPeers(peerList);
      });

      socket.on('FE-receiveCall', ({ signal, from, info }) => {
        let { userName, video, audio } = info;
        const peerIdx = findPeer(from);

        if (!peerIdx) {
          const peer = addPeer(signal, from, stream);
          peer.userName = userName;

          peersRef.current.push({
            peerId: from,
            peer,
            userName: userName
          });

          setPeers((users) => {
            return [...users, peer];
          });

          setUserAV((preList) => {
            return {
              ...preList,
              [peer.userName]: { video, audio }
            };
          });
        }
      });

      socket.on('FE-callAccepted', ({ signal, answerId }) => {
        const peerIdx = findPeer(answerId);
        peerIdx.peer.signal(signal);
      });

      socket.on('FE-userLeave', ({ userId, leaver }) => {
        const peerIdx = findPeer(userId);
        peerIdx.peer.destroy();
        setPeers((users) => {
          users = users.filter((user) => user.peerId !== peerIdx.peer.peerId);
          return [...users];
        });
        peersRef.current = peersRef.current.filter(
          ({ peerId }) => peerId !== userId
        );
      });

      socket.on('FE-userRemoved', ({ userId, userName }) => {
        const peerIdx = findPeer(userId);
        peerIdx.peer.destroy();
        setPeers((users) => {
          users = users.filter((user) => user.peerId !== peerIdx.peer.peerId);
          return [...users];
        });
        peersRef.current = peersRef.current.filter(
          ({ peerId }) => peerId !== userId
        );
        alert(`${userName} has been removed from the meeting.`);
      });

      socket.on('FE-youRemoved', () => {
        alert('You have been removed from the meeting!');
        window.location.href = '/';
      })

    });

    socket.on('FE-toggleCamera', ({ userId, switchTarget }) => {
      const peerIdx = findPeer(userId);

      setUserAV((preList) => {
        let video = preList[peerIdx.userName].video;
        let audio = preList[peerIdx.userName].audio;

        if (switchTarget === 'video') video = !video;
        else audio = !audio;

        return {
          ...preList,
          [peerIdx.userName]: { video, audio },
        };
      });
    });

    return () => {
      socket.disconnect();
    }

  }, []);

  // const getIpAddress = async() => {
  //   const ip_response = await fetch("http://checkip.amazonaws.com");
  //   let myIPaddr = await ip_response.data;
  //   console.log(myIPaddr);
  //   setClientIpAddress(myIPaddr);
  // }

  function createPeer(userId, caller, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-callUser', {
        userToCall: userId, from: caller, signal
      });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    return peer;
  }


  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', (signal) => {
      socket.emit('BE-acceptCall', { signal, caller: callerId });
    });

    peer.on('disconnect', () => {
      peer.destroy();
    });

    peer.signal(incomingSignal);

    return peer;
  }


  function findPeer(pid) {
    return peersRef.current.find((p) => p.peerId === pid);
  }


  function createUserVideo(peer, index, arr) {
    return (
      <Grid item key={index} xs={6} md={4}
        sx={{ position: 'relative' }}>
        <DisplayName>{peer.userName}</DisplayName>
        <VideoCard key={index} peer={peer} number={arr.length} />
      </Grid>
    );
  }


  const leaveRoom = () => {
    socket.emit('BE-leaveRoom', { roomId, leaver: currentUser });
    window.location.href = '/';
  };


  const toggleCamera = (e) => {
    let audio = userAV.localUser.audio;
    setUserAV((preList) => {
      let videoSwitch = preList['localUser'].video;
      videoSwitch = !videoSwitch;
      userVideoRef.current.srcObject
        .getVideoTracks()[0].enabled = videoSwitch;

      return {
        ...preList,
        localUser: { video: videoSwitch, audio: audio }
      }
    });
    socket.emit('BE-toggleCameraAudio', { roomId, switchTarget: 'video' });
  }


  const toggleAudio = (e) => {
    let video = userAV.localUser.video;
    setUserAV((preList) => {
      let audioSwitch = preList['localUser'].audio;
      const userAudioTrack =
        userVideoRef.current.srcObject.getAudioTracks()[0];
      audioSwitch = !audioSwitch;
      if (userAudioTrack) {
        userAudioTrack.enabled = audioSwitch;
      } else {
        userStream.current.getAudioTracks()[0].enabled = audioSwitch;
      }

      return {
        ...preList,
        localUser: { video: video, audio: audioSwitch }
      }
    });
    socket.emit('BE-toggleCameraAudio', { roomId, switchTarget: 'audio' });
  }


  const openSettings = () => {
    console.log('openSettings');
  }

  // To share screen
  const shareScreen = () => {

    if (!screenShare) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((stream) => {
          const screenTrack = stream.getTracks()[0];
          peersRef.current.forEach(({ peer }) => {
            peer.replaceTrack(
              peer.streams[0]
                .getTracks()
                .find((track) => track.kind === 'video'),
              screenTrack,
              userStream.current
            );
          });

          screenTrack.onended = () => {
            peersRef.current.forEach(({ peer }) => {
              peer.replaceTrack(
                screenTrack,
                peer.streams[0]
                  .getTracks()
                  .find((track) => track.kind === 'video'),
                userStream.current
              );
            });
            userVideoRef.current.srcObject = userStream.current;
            setScreenShare(false);
          };
          userVideoRef.current.srcObject = stream;
          screenTrackRef.current = screenTrack;
          setScreenShare(true);
        });
    } else {
      screenTrackRef.current.onended();
    }
  }

  // To get list of participants in the room
  const getParticipantsList = () => {
    socket.emit('BE-getParticipants', { roomId });
    socket.on('FE-getParticipants', (partcipants) => setParticipants(partcipants));
  }

  // To remove a participant
  const removeParticipant = (participantId, username) => {
    let removeMessage = `Remove ${username} from meeting ?`
    if (window.confirm(removeMessage)) {
      socket.emit('BE-removeUser', { roomId, clientId: participantId });
    }
  }


  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="s"
        sx={{
          marginTop: '15vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <CssBaseline />
        <Grid container spacing={{ xs: 1, md: 2 }}
          direction="row"
          justifyContent="space-evenly"
          alignItems="center">
          <Grid item xs={6} md={4}
            sx={{ position: 'relative' }}>
            <DisplayName>{currentUser}</DisplayName>
            <video
              autoPlay
              playsInline
              muted
              ref={userVideoRef}
              style={{
                maxHeight: '40vh',
                maxWidth: '50vw',
                border: '2px solid white',
                borderRadius: 5
              }}
            >
            </video>
          </Grid>
          {peers && peers.map((peer, index, arr) =>
            createUserVideo(peer, index, arr))}
        </Grid>
        
        <Typography variant='h5' sx={{
          marginTop: "70vh",
          position: "absolute",
          left: '5vw',
          color: 'white',
          fontWeight: "medium",
          padding: 1,
        }}>Room Id: {roomId} <br /> User: {currentUser}</Typography>

        <Chat />
        <BottomBar
          roomId={roomId}
          username={currentUser}
          userAV={userAV}
          toggleCamera={toggleCamera}
          toggleAudio={toggleAudio}
          leaveRoom={leaveRoom}
          shareScreen={shareScreen}
          screenShareActive={screenShare}
          openSettings={openSettings}
          openChat={handleChatOpen}
          closeChat={handleChatClose}
          chatopen={chatOpen}
          openParticipantsList={handleParticipantsOpen}
          closeParticipantsList={handleParticipantsClose}
          participantsOpen={participantsOpen}
        />
        <Chat open={chatOpen} roomId={roomId} thisUser={userName} />
        <Participants
          isHost={isHost}
          participants={participants}
          open={participantsOpen}
          removeParticipant={removeParticipant}
        />
      </Container>
    </ThemeProvider>
  )
}
