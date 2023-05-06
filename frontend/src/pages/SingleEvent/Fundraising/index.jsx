import React, { useState } from 'react';
import FundraisingCard from './subpages/FundraisingCard';
import DonationHistory from './subpages/DonationHistory';
import { Box } from '@chakra-ui/react';
import CancelModal from './subpages/CancelModal';
import { useSelector } from 'react-redux';

const Index = () => {
  const [openModal, setOpenModal] = useState(false);
  const { fundRaising } = useSelector(state => state.event);

  return (
    <Box>
      {openModal && (
        <CancelModal
          setOpenModal={setOpenModal}
          id={fundRaising?.id}
        />
      )}
      <FundraisingCard
        openModal={openModal}
        setOpenModal={setOpenModal}
        fundRaising={fundRaising}
      />
      <DonationHistory openModal={openModal} setOpenModal={setOpenModal} />
    </Box>
  );
};

export default Index;