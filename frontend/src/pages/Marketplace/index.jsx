import { Box, Heading, Text, Button } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import MarketplaceOptions from './MarketplaceOptions';
import Market from './subpages/Market/Market';
import { GetAsoebiItemsApi } from '../../redux/axios/apis/asoebi';
import { GetGiftItemsApi } from '../../redux/axios/apis/gift';
import Cart from './subpages/Cart/Cart';
import Asoebi from './subpages/Market/Asoebi';
import { dispatch } from '../../redux/store';
import { GetGiftItems } from '../../redux/features/gift/service';
import { GetAsoebiItems } from '../../redux/features/events/service';
import { GetSourvenirItemsApi } from '../../redux/axios/apis/sourvenir';

const Index = () => {
  const [position, setPosition] = useState(-1);
  const [showProducts, setShowProducts] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [sourvenirItems, setSourvenirItems] = useState([]);
  const [giftItems, setGiftItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [sourvenirCart, setSourvenirCart] = useState([]);

  const getSourvenirs = async() => {
    try {
      const response = await GetSourvenirItemsApi();
      const data = await response.data;
      setSourvenirItems(data);
      console.log(data);
    } catch (error) {
      
    }
  }

  const getGiftItems = async () => {
    try {
      const response = await GetGiftItemsApi();
      const data = await response.data;
      setGiftItems(data);
      console.log(data);
    } catch (error) {

    }
  }

  useEffect(() => {
    dispatch(GetGiftItems())
    dispatch(GetAsoebiItems());
    getSourvenirs();
    getGiftItems();
  }, []);

  return (
    <Box>
      <Box
        bg="#F5F5F5"
        minH="580px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box w="90%" mx="auto">
          {!showProducts ? (
            <Box>
              <Box textAlign="center" maxW="540px" mx="auto" mb="8">
                <Heading fontSize={36} mb="5">
                  Welcome to marketplace
                </Heading>
                <Text fontSize={14}>
                  We have created this page so you could find things that you
                  need for your event and easily order for it for yourself.
                </Text>
              </Box>
              <MarketplaceOptions
                setPosition={setPosition}
                setShowProducts={setShowProducts}
              />
              <Box textAlign="center" onClick={() => setShowProducts(true)}>
                <Button
                  fontWeight="medium"
                  fontSize={14}
                  color="white"
                  bg="#00BFB2"
                  h="50px"
                  w="210px"
                  _hover={{ bg: '#00BFB2' }}
                >
                  {' '}
                  Proceed to market
                </Button>
              </Box>
            </Box>
          ) : (
            <>
                <Box>
                  {position === 1 && <Market 
                      setShowProducts={setShowProducts}
                      setShowCart={setShowCart} 
                      data={giftItems}
                      cart={cart}
                      setCart={setCart}
                  />}
                  {position === 0 && (
                    <Asoebi
                      setShowProducts={setShowProducts}
                      setShowCart={setShowCart}
                    />
                  )}
                  {position === 2 && (
                    <Market
                      setShowProducts={setShowProducts}
                      setShowCart={setShowCart}
                      data={sourvenirItems}
                      cart={cart}
                      setCart={setCart}
                    />
                  )}
                </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Index;
