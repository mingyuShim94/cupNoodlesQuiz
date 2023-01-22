import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Image,
  Animated,
  Pressable,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import styled from "styled-components/native";
import { FontAwesome } from "@expo/vector-icons";
import problemList from "../assets/problemList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { requestPurchase, useIAP, withIAPContext } from "react-native-iap";
import Modal from "react-native-modal";
const STORAGE_KEY_RECORD = "@my_record";
const STORAGE_KEY_COIN = "@my_coins";
const STORAGE_KEY_BANNER = "@my_banner";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
import { Audio } from "expo-av";

const itemSkus = ["1000_coin", "2000_coin", "banner_remove"];
const shopText = {
  "1000_coin": { name: "1000코인 충전", cost: "₩1,000" },
  "2000_coin": { name: "2000코인 충전", cost: "₩2,000" },
  banner_remove: { name: "배너광고 제거", cost: "₩1,000" },
};
const StageSelect = ({ navigation: { navigate, addListener } }) => {
  const {
    products,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
  } = useIAP();
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const [coin, setCoin] = useState(100);
  const [isShopModalVisible, setIsShopModalVisible] = useState(false);
  const coinData = useRef(0);
  const [clickSound, setClickSound] = useState();
  const scaleArr = useRef(
    Array.from({ length: problemList.length }, (v, i) => new Animated.Value(1))
  ).current;

  useEffect(() => {
    addListener("focus", () => {
      getRecordData();
      getCoinData();
    });
  }, []);

  const clickSoundPlay = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/popClick.wav")
    );
    setClickSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };

  const getRecordData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_RECORD);
      if (value == null) {
        return;
      } else {
        setRecord(JSON.parse(value));
      }
    } catch (e) {
      alert(e);
    }
  };
  const storeCoinData = async () => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_COIN,
        JSON.stringify(coinData.current)
      );
    } catch (e) {
      alert(e);
    }
  };
  const getCoinData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_COIN);
      if (value == null) {
        setCoin(100);
        coinData.current = 100;
      } else {
        setCoin(JSON.parse(value));
        coinData.current = JSON.parse(value);
      }
    } catch (e) {
      alert(e);
    }
  };
  const storeBannerData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BANNER, JSON.stringify(false));
    } catch (e) {
      alert(e);
    }
  };
  const handlePurchase = async (sku) => {
    console.log("sku", sku);

    try {
      await requestPurchase({ skus: [sku] });
    } catch (error) {
      console.log("request purchase error: ", error);
    }
  };

  useEffect(() => {
    // ... listen to currentPurchaseError, to check if any error happened
    const USER_CANCEL = "E_USER_CANCELLED";
    if (currentPurchaseError != undefined) {
      if (currentPurchaseError.code === USER_CANCEL) {
        Alert.alert("구매 취소", "구매를 취소하셨습니다.");
      } else {
        Alert.alert("구매 실패", "구매 중 오류가 발생하였습니다.");
      }
    }
  }, [currentPurchaseError]);

  useEffect(() => {
    const checkCurrentPurchase = async (purchase) => {
      if (purchase) {
        const receipt = purchase.transactionReceipt;
        console.log("영수증", receipt);
        if (receipt)
          try {
            const ackResult = await finishTransaction({
              purchase,
              isConsumable: true, //false:true
            });
            console.log("ackResult", ackResult);
            if (purchase) givePurchase(purchase.productId);
          } catch (ackErr) {
            console.warn("ackErr_StageSelect", ackErr);
          }
      }
    };

    checkCurrentPurchase(currentPurchase);
  }, [currentPurchase, finishTransaction]);
  const givePurchase = (itemId) => {
    if (itemId == itemSkus[0]) {
      //1000_coin
      setCoin((prev) => prev + 1000);
      coinData.current += 1000;
      storeCoinData();
    } else if (itemId == itemSkus[1]) {
      //2000_coin
      //Math.floor(Math.random() * (max - min + 1)) + min
      const randValue = Math.floor(Math.random() * (50 - 10 + 1)) + 10; //10~50
      // console.log("2000코인구매", 2000 + randValue * 10);
      setCoin((prev) => prev + 2000 + randValue * 10);
      coinData.current += 2000 + randValue * 10;
      storeCoinData();
    } else if (itemId == itemSkus[2]) {
      storeBannerData();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WindowContainer>
        <StatusBar style="light" backgroundColor="black" />
        <Header>
          <ShopView>
            <ShopTextView>
              <Text
                style={{
                  fontFamily: "insungitCutelivelyjisu",
                  fontSize: WindowWidth / 27.4285,
                }}
              >
                {"코인충전"}
              </Text>
            </ShopTextView>
            <ShopBtn
              onPress={() => {
                getProducts({
                  skus: itemSkus,
                });
                setIsShopModalVisible(true);
              }}
            >
              <FontAwesome
                name="plus-circle"
                size={WindowWidth / 17.1428}
                color="#FDB60C"
              />
            </ShopBtn>
          </ShopView>
          <ScoreView>
            <Text
              style={{
                fontFamily: "insungitCutelivelyjisu",
                fontSize: WindowWidth / 18.7012,
              }}
            >
              {record.filter((element) => true === element).length +
                "/" +
                record.length}
            </Text>
          </ScoreView>
          <CoinView>
            <Image
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "contain",
                position: "absolute",
                right: WindowWidth / 11.7551,
                zIndex: 1,
                top: WindowHeight / 408.2857,
              }}
              source={require("../assets/Coin.png")}
            />
            <CoinTextView>
              <Text
                style={{
                  fontFamily: "insungitCutelivelyjisu",
                  fontSize: WindowWidth / 27.4285,
                }}
              >
                {coin}
              </Text>
            </CoinTextView>
          </CoinView>
        </Header>
        <SelectView
          data={problemList}
          numColumns={3}
          keyExtractor={(item, index) => index}
          ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
          columnWrapperStyle={{
            justifyContent: "space-around",
          }}
          contentContainerStyle={{ paddingBottom: WindowHeight / 40.8285 }}
          renderItem={({ item, index }) => {
            return (
              <StageView
                android_disableSound={true}
                onPressIn={() => {
                  scaleArr[index].setValue(0.9);
                }}
                onPress={() => {
                  clickSoundPlay();
                  navigate("Quiz", { stageIndex: index });
                }}
                onPressOut={() => {
                  scaleArr[index].setValue(1);
                }}
                style={{
                  transform: [{ scale: scaleArr[index] }],
                }}
              >
                {record[index] == false ? (
                  <Image
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: 10,
                      resizeMode: "contain",
                    }}
                    source={require("../assets/cupIilust.jpg")}
                  />
                ) : (
                  <Image
                    style={{
                      height: "100%",
                      width: "100%",
                      borderRadius: 10,
                      resizeMode: "contain",
                    }}
                    source={item.img}
                  />
                )}

                <IndexText>{index + 1}</IndexText>
              </StageView>
            );
          }}
        />
        <Modal
          isVisible={isShopModalVisible}
          backdropOpacity={0.4}
          useNativeDriver={true}
          animationIn={"pulse"}
          animationOut={"zoomOut"}
          onBackdropPress={() => {
            setIsShopModalVisible(false);
          }}
          onBackButtonPress={() => {
            setIsShopModalVisible(false);
          }}
        >
          <ShopModal>
            <ShopModalHeader>
              <Text
                style={{
                  fontFamily: "insungitCutelivelyjisu",
                  fontSize: WindowWidth / 18.7012,
                }}
              >
                {"현재 보유코인 :  " + coin + " 개"}
              </Text>
            </ShopModalHeader>
            <ShopModalContentsContainer>
              {products.map((product) => (
                <ShopModalContents key={product.productId}>
                  <ShopModalContentsTextContainer>
                    <ShopModalText>
                      {shopText[product.productId].name}
                    </ShopModalText>

                    {product.productId == itemSkus[1] ? (
                      <CostText>{"+랜덤추가지급:0~500"}</CostText>
                    ) : null}
                  </ShopModalContentsTextContainer>

                  <ContentsPriceBtn
                    onPress={() => handlePurchase(product.productId)}
                  >
                    <CostText>{shopText[product.productId].cost}</CostText>
                    <CostText>{"구입"}</CostText>
                  </ContentsPriceBtn>
                </ShopModalContents>
              ))}
            </ShopModalContentsContainer>
          </ShopModal>
        </Modal>
      </WindowContainer>
    </SafeAreaView>
  );
};
export default withIAPContext(StageSelect);

const WindowContainer = styled.View`
  flex: 1;
  background-color: slateblue;
  padding-horizontal: ${WindowWidth / 34.2857}px;
`;
const Header = styled.View`
  flex: 0.065;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const CoinView = styled.View`
  //background-color: blue;
  width: ${WindowWidth / 5.8775}px;
  height: ${WindowHeight / 20.4142}px;
  align-items: center;
  position: absolute;
  right: ${WindowWidth / 27.4285}px;
  flex-direction: row;
`;
const CoinTextView = styled.View`
  background-color: white;
  border-radius: ${WindowWidth / 16.4571}px;
  width: ${WindowWidth / 5.8775}px;
  height: ${WindowHeight / 27.219}px;
  justify-content: center;
  align-items: flex-end;
  padding-right: ${WindowWidth / 60}px;
`;
const ShopView = styled.View`
  background-color: white;
  width: ${WindowWidth / 3.5776}px;
  height: ${WindowHeight / 27.219}px;
  border-radius: ${WindowWidth / 16.4571}px;
  align-items: center;
  position: absolute;
  left: 0px;
  flex-direction: row;
`;
const ShopTextView = styled.View`
  width: ${WindowWidth / 4.6753}px;
  height: ${WindowHeight / 27.219}px;
  justify-content: center;
  align-items: center;
`;
const ShopBtn = styled.TouchableOpacity`
  width: ${WindowWidth / 10.2857}px;
  height: ${WindowHeight / 20.4142}px;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0px;
`;
const ShopModal = styled.View`
  background-color: lightcoral;
  width: ${WindowWidth / 1.3714}px;
  height: ${WindowHeight / 1.6331}px;
  align-self: center;
  align-items: center;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ShopModalHeader = styled.View`
  margin-top: ${WindowHeight / 81.6571}px;
  //background-color: red;
  width: ${WindowWidth / 1.6457}px;
  height: ${WindowHeight / 11.6653}px;
  align-self: center;
  justify-content: center;
  align-items: center;
  justify-content: center;
`;
const ShopModalContentsContainer = styled.View`
  //background-color: white;
  width: ${WindowWidth / 1.6457}px;
  height: ${WindowHeight / 2.0414}px;
  align-self: center;
  justify-content: space-evenly;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ShopModalContents = styled.View`
  background-color: #80f0f0;
  width: ${WindowWidth / 1.6457}px;
  height: ${WindowHeight / 8.1657}px;
  align-items: center;
  justify-content: space-evenly;
  border-radius: ${WindowWidth / 16.4571}px;
  flex-direction: row;
`;
const ShopModalContentsTextContainer = styled.View`
  // background-color: white;
  width: ${WindowWidth / 2.7428}px;
  height: ${WindowHeight / 8.1657}px;
  justify-content: center;
  align-items: center;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ShopModalText = styled.Text`
  font-size: ${WindowWidth / 20.5714}px;
  font-family: insungitCutelivelyjisu;
`;
const CostText = styled.Text`
  font-size: ${WindowWidth / 27.4285}px;
  font-family: insungitCutelivelyjisu;
  padding-top: ${WindowHeight / 272.1904}px;
`;
const ContentsPriceBtn = styled.TouchableOpacity`
  background-color: #f0b880;
  width: ${WindowWidth / 5.8775}px;
  height: ${WindowHeight / 11.6653}px;
  border-radius: ${WindowWidth / 20.5714}px;
  justify-content: center;
  align-items: center;
`;
const ScoreView = styled.View`
  background-color: white;
  width: ${WindowWidth / 3.9183}px;
  height: ${WindowHeight / 23.3306}px;
  border-radius: ${WindowWidth / 16.4571}px;
  align-items: center;
  justify-content: center;
  position: absolute;
`;
const SelectView = styled.FlatList`
  flex: 0.935;
  padding-top: ${WindowHeight / 41.1428}px;
`;
const StageView = styled(Animated.createAnimatedComponent(Pressable))`
  width: ${WindowWidth / 3.6}px;
  height: ${WindowWidth / 3.6}px;
`;

const IndexText = styled.Text`
  font-size:${WindowWidth / 27.4285}px;
  background-color:black;
  alignSelf:flex-start
  paddingHorizontal:${WindowWidth / 137.1428}px;
  paddingTop:${WindowHeight / 408.2857}px;
  position:absolute;
  fontFamily:insungitCutelivelyjisu;
  color:white;
  borderTopLeftRadius:${WindowWidth / 41.1428}px;
`;
