import { ExternalLinkIcon } from '@chakra-ui/icons'
import {
  Box, Heading, Text, Flex, Checkbox, Input, FormLabel, Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  useDisclosure,
  ModalFooter,
  ModalHeader,
  Avatar, AvatarBadge, Center
} from '@chakra-ui/react'
import React, {useState} from 'react'
import errorImg from '../../../assets/errorImg.svg'
import defaultImg from '../../../assets/default-image.svg'
import { useSelector } from 'react-redux'

const SummaryForm = () => {

  const { newEvent } = useSelector(state => state.event);
  console.log(newEvent)
  const [openModal, setOpenModal] = useState(false);
  const [percentage, setPercentage] = useState('')
  const [image, setImage] = useState(null);



  const showModal = () => {
    setOpenModal(true);
  }

  return (
    <Box mt='8' w='80%' mx='auto' mb='16'>
      {openModal && <ConfirmationModal setOpenModal={setOpenModal} />}
      <Flex alignItems='center' justifyContent='space-between' mb='5'>
        <Box>
          <Heading mb='2' fontSize={30} fontWeight='semibold'>Summary</Heading>
          <Text color='#717171' fontSize={14}>Review all you have been setting so far.</Text>
        </Box>

        <Box>
          <Flex alignItems='center' gap={2} color='#00BFB2'>
            <Text>Preview your event</Text>
            <ExternalLinkIcon />
          </Flex>
        </Box>
      </Flex>


      <Box w='100%' bg='#EEEEEE' h='380px' borderRadius={5} mb='10' display='Flex' alignItems='center' justifyContent='Center'>
        <Image src={`https://giftcircle-ws.onrender.com/api/images/${newEvent.image}`} />
      </Box>

      <Box mb='10'>
        <Heading mb='4' fontWeight={600} fontSize={18}>When should we publish your event?</Heading>
        <Box mb='2' display='flex' alignItems='center' gap={2}>
          <Checkbox colorScheme='teal' />
          <Text fontSize={14}>Publish now</Text>
        </Box>
        <Box mb='2' display='flex' alignItems='center' gap={2}>
          <Checkbox colorScheme='teal' />
          <Text fontSize={14}>Schedule for later</Text>
        </Box>
      </Box>

      <Box w='500px' mb='12'>
        <Heading mb='4' fontWeight={600} fontSize={18}>Apply Donation to charity</Heading>
        <FormLabel fontWeight={550} fontSize={14}>How many percentage do you want to add?</FormLabel>
        <Input type='text' bg='#F4F4F4' placeholder='e.g 2%' fontSize={15} mb='3' value={percentage} onChange={(e) => setPercentage(e.tagert.value)} />
        <Box mb='2' display='flex' alignItems='center' gap={2}>
          <Checkbox isChecked={true} />
          <Text fontSize={14}>Apply 2% to all cost of items to be donated to charity homes</Text>
        </Box>
      </Box>

      <Box w='182px' mx='auto'>
        <Button bg='#00BFB2' w='182px' fontSize={14} fontWeight={500} color='white' textAlign='center' onClick={showModal}>Finish</Button>
      </Box>

    </Box>
  )
}

export default SummaryForm


export const ConfirmationModal = ({setOpenModal}) => {
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: true });
  const [ active, setActive ] = useState(false);

  const setChecked = () => {
    setActive(!active);
  }

  const closeModal = () => {
    setOpenModal(false)
  }

  return (
    <>
      <Modal closeOnOverlayClick={false} onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent maxW='420px' bg='white' py='8' px='6'>
          <Box>
            <ModalCloseButton onClick={closeModal} />
            <ModalBody>
              <Image src={errorImg} display='block' mx='auto' mb='3' />
              <Box textAlign='center' mb='4'>
                <Heading fontWeight={600} fontSize='25px' mb='3'>Enable Donations</Heading>
                <Text fontSize={14}>Are you sure you want to add 2% to all items cost to be donated to charity homes?</Text>
              </Box>
             
              <Box mb='5' display='flex' alignItems='center' gap={2} >
                <Checkbox isChecked={true} />
                <Text fontSize={14}>I agree to Event Circle's terms and conditions</Text>
              </Box>

              <Box textAlign='center'>
                <Button fontWeight='medium' fontSize={14} color='white' bg={active ? '#00BFB2' : '#AAEAE5'}>Yes add 2% of cost items</Button>
              </Box>
            </ModalBody>
          </Box>
        </ModalContent>
      </Modal>
    </>
  )
}