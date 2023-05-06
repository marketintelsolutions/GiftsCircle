import React, { createContext, useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormLabel,
  Input,
  Button,
  FormControl,
  Heading,
  Text,
  useToast,
} from '@chakra-ui/react';
import AsoebiMarket from './AsoebiMarket';
import Cart from './Cart';
import BackButton from '../../../../../components/Buttons/BackButton';
import { useSelector } from 'react-redux';
import { dispatch } from '../../../../../redux/store';
import { GetEventAsoebis } from '../../../../../redux/features/events/service';

export const AsoebiContext = createContext(null);

const Index = ({ setShowProducts }) => {
  const { asoebiItems, eventAsoebis } = useSelector(state => state.event);
  const [AsoebiItems, setAsoebiItems] = useState([]);
  const [addedAsoebiItems, setAddedAsoebiItems] = useState([]);
  const [data, setData] = useState([...AsoebiItems, ...eventAsoebis]);
  const [amount, setAmount] = useState(0);

  const contextValue = useMemo(
    () => ({
      data: [...AsoebiItems, ...eventAsoebis],
      AsoebiItems,
      addedAsoebiItems,
      amount,
    }),
    [AsoebiItems, addedAsoebiItems, amount, eventAsoebis]
  );

  const [eventId, setEventId] = useState('');
  const [showAsoebi, setShowAsoebi] = useState(false);
  const [showAsoebiCart, setShowAsoebiCart] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (eventId !== '') {
      dispatch(GetEventAsoebis(eventId));
    }
  }, [eventId]);

  useEffect(() => {
    let amount = 0;

    AsoebiItems.forEach(ele => {
      amount += asoebiItems.find(x => x.id === ele.asoebiItem).amount;
    });
    setAmount(amount);
  }, [AsoebiItems, asoebiItems]);

  const handleClick = () => {
    if (eventId) {
      setShowAsoebi(true);
    } else {
      toast({
        title: 'Error',
        description: 'Please enter the event id',
        status: 'error',
        duration: 2000,
        isClosable: true,
        position: 'top',
      });
    }
  };
  return (
    <>
      {!showAsoebi ? (
        <Box w={{ base: '350px', md: '500px', lg: '500px' }} mx="auto" h="auto">
          <BackButton action={() => setShowProducts(false)} />
          <Heading
            textAlign="center"
            my="8"
            fontWeight="medium"
            fontSize={25}
            textTransform="capitalize"
          >
            Add Asoebi to event
          </Heading>

          <FormControl>
            <Box mb="5">
              <FormLabel>Enter Event Id</FormLabel>
              <Input
                placeholder="Please enter the event id"
                bg="#F4F4F4"
                fontSize={14}
                _placeholder={{ color: '#A8A8A8' }}
                value={eventId}
                onChange={e => setEventId(e.target.value)}
              />
            </Box>

            <Text fontSize={14} mb="5" fontWeight="medium">
              By clicking "Add Asoebi", you agree to our Terms of Services and
              Privacy Statement
            </Text>
            <Box textAlign="center">
              <Button
                w="100%"
                bg="#00BFB2"
                fontWeight="medium"
                fontSize={14}
                color="white"
                onClick={handleClick}
              >
                Proceed to marketplace
              </Button>
            </Box>
          </FormControl>
        </Box>
      ) : (
        <AsoebiContext.Provider
          value={{
            ...contextValue,
            setAddedAsoebiItems,
            setAsoebiItems,
            setData,
          }}
        >
          <>
            {showAsoebiCart ? (
              <Cart eventId={eventId} setShowAsoebiCart={setShowAsoebiCart} />
            ) : (
              <AsoebiMarket
                setShowProducts={setShowProducts}
                setShowAsoebiCart={setShowAsoebiCart}
                eventId={eventId}
              />
            )}
          </>
        </AsoebiContext.Provider>
      )}
    </>
  );
};

export default Index;