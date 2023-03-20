import React, { useEffect, useRef } from 'react';

const VideoCard = (props) => {
  const videoRef = useRef();
  const peer = props.peer;

  useEffect(() => {
    peer.on('stream', (stream) => {
      videoRef.current.srcObject = stream;
    });
  }, [peer]);

  return (
    <video
      autoPlay
      playsInline
      ref={videoRef}
      style={{
        maxHeight: '40vh',
        maxWidth: '50vw',
        border: '2px solid white',
        borderRadius: 5
      }}
    >
    </video>
  )
}

export default VideoCard;
