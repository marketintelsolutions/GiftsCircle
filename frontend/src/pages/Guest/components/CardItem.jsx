import { Box, Image } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import ImageModal from './ImageModal';

const Card = ({ item }) => {
  const [type, setType] = useState('IMAGE');
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    if (item.includes('.mp4')) {
      setType('VIDEO');
    } else if (item.includes('.mp3')) {
      setType('AUDIO');
    } else {
      setType('IMAGE');
    }
  }, [item]);

  return (
    <>
      {showImageModal && (
        <ImageModal image={item} setShowImageModal={setShowImageModal} />
      )}
      <Box
        w="282px"
        h="282px"
        bg="white"
        borderRadius={5}
        boxShadow="md"
        cursor="pointer"
        onClick={() => setShowImageModal(true)}
        // border='1px solid #C6C6C6'
      >
        {type === 'IMAGE' ? (
          <Image
            src={item}
            w="100%"
            h="100%"
            borderRadius={5}
            alt="item item image"
            display="block"
            mx="auto"
            objectFit="cover"
            boxShadow="sm"
          />
        ) : (
          <>
            {type === 'VIDEO' ? (
              <video
                controls
                width="100%"
                height="330px"
                poster={item.replace('.mp4', '.jpg')}
              >
                <source src={item} type="video/mp4" />
                Sorry, your browser doesn't support videos.
              </video>
            ) : (
              <audio controls>
                <source src={item} type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            )}
          </>
        )}
      </Box>
    </>
  );
};

export default Card;
