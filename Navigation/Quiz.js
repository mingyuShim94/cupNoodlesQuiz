import React, { useEffect, useState, useRef } from "react";
import {
  Text,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Shadow } from "react-native-shadow-2";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
const STORAGE_KEY_COIN = "@my_coins";
const STORAGE_KEY_RECORD = "@my_record";
const STORAGE_KEY_BANNER = "@my_banner";
import problemList from "../assets/problemList";
import hintInitialList from "../assets/hintInitialList";
import { Octicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Modal from "react-native-modal";
import { SafeAreaView } from "react-native-safe-area-context";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";
import { requestPurchase, useIAP, withIAPContext } from "react-native-iap";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useRewardedAd,
  useInterstitialAd,
} from "react-native-google-mobile-ads";
const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-8647279125417942/6622534546";
const rewardeAdUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-8647279125417942/5888900748";
const interAdUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-8647279125417942/3747225625";

const itemSkus = ["1000_coin", "2000_coin", "banner_remove"];
const shopText = {
  "1000_coin": { name: "1000코인 충전", cost: "₩1,000" },
  "2000_coin": { name: "2000코인 충전", cost: "₩2,000" },
  banner_remove: { name: "배너광고 제거", cost: "₩1,000" },
};
const tempHintInitialList = Array.from(hintInitialList);

const Quiz = ({ route, navigation: { goBack } }) => {
  const {
    products,
    currentPurchase,
    currentPurchaseError,
    finishTransaction,
    getProducts,
  } = useIAP();
  const {
    isLoaded: rewardIsLoaded,
    isClosed: rewardIsClosed,
    load: rewardLoad,
    show: rewardShow,
  } = useRewardedAd(rewardeAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  const {
    isLoaded: interIsLoaded,
    isClosed: interIsClosed,
    load: interLoad,
    show: interShow,
  } = useInterstitialAd(interAdUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });
  const [trueSound, setTrueSound] = useState();
  const [wrongSound, setWrongSound] = useState();
  const [clickSound, setClickSound] = useState();
  const [stage, setStage] = useState(route.params.stageIndex);
  const [hintLevel, setHintLevel] = useState(false);
  const [hintText, setHintText] = useState("");
  const [hintIndex, setHintIndex] = useState(
    Array.from({ length: tempHintInitialList[stage].length }, (v, i) => i)
  );
  const [isShopModalVisible, setShopModalVisible] = useState(false);
  const [isSelectModalVisible, setSelectModalVisible] = useState(false);
  const [isFalseModalVisible, setFalseModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [myAnswer, setMyAnswer] = useState("");
  const [coin, setCoin] = useState(0);
  const [blur, setBlur] = useState(true);
  const [hideShareBtn, setHideShareBtn] = useState(false);
  const [bannerShow, setBannerShow] = useState(true);
  const [hintCost, setHintCost] = useState(10);
  const [hintName, setHintName] = useState("초성힌트");
  const scaleHintBtn = useRef(new Animated.Value(1)).current;
  const scaleNextBtn = useRef(new Animated.Value(1)).current;
  const scaleHomeBtn = useRef(new Animated.Value(1)).current;
  const scaleAdsBtn = useRef(new Animated.Value(1)).current;
  const scaleFriendBtn = useRef(new Animated.Value(1)).current;
  const scaleShareBtn = useRef(new Animated.Value(1)).current;
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const coinData = useRef(0);
  const coinUse = () => {
    setCoin((prev) => prev - hintCost);
    coinData.current -= hintCost;
    storeCoinData();
  };
  useEffect(() => {
    setHintIndex(() =>
      Array.from({ length: tempHintInitialList[stage].length }, (v, i) => i)
    );
  }, [stage]);
  useEffect(() => {
    getCoinData();
    getRecordData();
    getBannerData();
    // rewardLoad();
    // interLoad();
  }, []);
  const ref = useRef();

  const onShot = () => {
    ref.current.capture().then((uri) => {
      onShare(uri);
    });
  };
  const onShare = async (uri) => {
    console.log("uri", uri);
    const shareResponse = await Share.open({ url: uri })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        err && console.log(err);
      });

    setHideShareBtn(false);
  };

  console.log("rewardLoad!!", rewardIsLoaded);
  console.log("interLoad!!", interIsLoaded);
  useEffect(() => {
    // console.log("rewardLoad!!", rewardIsLoaded);
    rewardLoad();
  }, [rewardLoad]);
  useEffect(() => {
    // console.log("interLoad!!", interIsLoaded);
    interLoad();
  }, [interLoad]);
  useEffect(() => {
    if (rewardIsClosed) {
      console.log("RewardClose!!");
      setCoin((prev) => prev + 100);
      coinData.current += 100;
      storeCoinData();
      rewardLoad();
    }
  }, [rewardIsClosed]);

  useEffect(() => {
    if (interIsClosed) {
      console.log("InterClose!!");

      goBack();
    }
  }, [interIsClosed]);
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
              isConsumable: true,
            });
            console.log("ackResult", ackResult);
            givePurchase(purchase.productId);
          } catch (ackErr) {
            console.warn("ackErrQuiz", ackErr);
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
      setBannerShow(false);
    }
  };

  const trueSoundPlay = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/true.wav")
    );
    setTrueSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };
  const wrongSoundPlay = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/wrong.wav")
    );
    setWrongSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };

  const clickSoundPlay = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/hintClick.mp3")
    );
    setClickSound(sound);
    sound.setVolumeAsync(0.3);

    console.log("Playing Sound");
    await sound.playAsync();
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
  const storeRecordData = async () => {
    record[stage] = true;
    try {
      await AsyncStorage.setItem(STORAGE_KEY_RECORD, JSON.stringify(record));
    } catch (e) {
      alert(e);
    }
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

  const storeBannerData = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BANNER, JSON.stringify(false));
    } catch (e) {
      alert(e);
    }
  };
  const getBannerData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY_BANNER);
      if (value == null) {
        setBannerShow(true);
      } else {
        setBannerShow(false);
      }
    } catch (e) {
      alert(e);
    }
  };
  const checkAnswer = () => {
    myAnswer == problemList[stage].text
      ? (trueSoundPlay(),
        setSelectModalVisible(true),
        storeRecordData(),
        setBlur(!blur))
      : (wrongSoundPlay(),
        setMyAnswer(""),
        setFalseModalVisible(true),
        setTimeout(() => {
          setFalseModalVisible(false);
        }, 500));
  };

  const nextStage = () => {
    setSelectModalVisible(false);
    setMyAnswer("");
    setBlur(!blur);
    setHintText("");
    setHintLevel(false);
    setHintCost(10);
    setHintName("초성힌트");
    setStage((prev) => prev + 1);
  };
  const giveHint = () => {
    if (hintLevel == false) {
      setHintText(tempHintInitialList[stage]);
      setHintLevel(true);
      setHintName("한글자힌트");
    } else {
      if (hintIndex.length != 0) {
        setHintCost((prev) => prev + 10);
        const randIdx = Math.floor(Math.random() * hintIndex.length); //[0,1,2]에서 1뽑음   //1뽑음    //0뽑음
        const selIdx = hintIndex[randIdx]; //1     //2    //0
        let temp = Array.from(hintText);
        temp[selIdx] = problemList[stage].text[selIdx]; //ㅅ라ㅁ     //ㅅ라면    //신라면
        hintIndex.splice(randIdx, 1); //[0,2]    //[0]    //[]
        setHintText(temp);
        console.info("randIdx", randIdx);
        console.info("selIdx", selIdx);
        console.info("hintIndex", hintIndex);
        console.info("hintText", temp);
      }
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      enabled={false}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                    setShopModalVisible(true);
                  }}
                >
                  <FontAwesome
                    name="plus-circle"
                    size={WindowWidth / 17.1428}
                    color="#FDB60C"
                  />
                </ShopBtn>
              </ShopView>
              <StageView>
                <Text
                  style={{
                    fontFamily: "insungitCutelivelyjisu",
                    fontSize: WindowWidth / 24.2016,
                  }}
                >
                  {stage + 1}탄
                </Text>
              </StageView>
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

            <QuizContainer>
              <Image
                style={{ height: "95%", width: "90%", resizeMode: "contain" }}
                source={
                  blur == true
                    ? problemList[stage].imgBlur
                    : problemList[stage].img
                }
                borderRadius={10}
              />

              {rewardIsLoaded ? (
                <RewardAdsButton
                  style={{
                    transform: [{ scale: scaleAdsBtn }],
                  }}
                  onPressIn={() => {
                    scaleAdsBtn.setValue(0.9);
                    clickSoundPlay();
                  }}
                  onPressOut={() => {
                    scaleAdsBtn.setValue(1);
                    rewardShow();
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Octicons
                      name="video"
                      size={WindowWidth / 15.238}
                      color="red"
                    />
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <View
                      style={{
                        width: WindowWidth / 17.8881,
                        height: WindowHeight / 35.5031,
                        top: WindowHeight / 204.1428,
                      }}
                    >
                      <Image
                        style={{
                          height: "100%",
                          width: "100%",
                          resizeMode: "contain",
                        }}
                        source={require("../assets/Coin.png")}
                      />
                    </View>
                    <Text
                      style={{
                        fontFamily: "insungitCutelivelyjisu",
                        fontSize: WindowWidth / 24.2016,
                      }}
                    >
                      {"x100"}
                    </Text>
                  </View>
                </RewardAdsButton>
              ) : null}
            </QuizContainer>
            <AnswerContainer>
              <AnswerInput
                placeholder="무슨 컵라면 일까요?"
                onChangeText={(newText) => setMyAnswer(newText)}
                value={myAnswer}
                onSubmitEditing={() => checkAnswer()}
                autoFocus={false}
                style={{ fontFamily: "insungitCutelivelyjisu" }}
              />
            </AnswerContainer>
            <HintsContainer>
              <HintView
                style={
                  hintText.length > 6
                    ? { flexWrap: "wrap", paddingTop: WindowHeight / 40.8285 }
                    : null
                }
              >
                {hintText.length != 0
                  ? hintText.map((text, index) => {
                      return (
                        <Shadow
                          distance={1}
                          startColor={"#00000020"}
                          finalColor={"#ffbcbcbc"}
                          offset={[5, 8]}
                          style={styles.wordBoxShadow}
                          key={index}
                        >
                          <HintText>{text}</HintText>
                        </Shadow>
                      );
                    })
                  : null}
              </HintView>
              <HintBtn
                style={{
                  transform: [{ scale: scaleHintBtn }],
                }}
                onPressIn={() => {
                  scaleHintBtn.setValue(0.9);
                  clickSoundPlay();
                }}
                onPressOut={() => {
                  scaleHintBtn.setValue(1);

                  if (hintIndex.length != 0) {
                    if (coin - hintCost >= 0) {
                      coinUse();
                      giveHint();
                    } else {
                      console.info("돈없다!");
                    }
                  } else {
                    console.info("힌트다줌!");
                  }
                }}
              >
                <Text
                  style={{
                    fontFamily: "insungitCutelivelyjisu",
                    fontSize: WindowWidth / 24.2016,
                  }}
                >
                  {hintName}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  <View
                    style={{
                      width: WindowWidth / 17.8881,
                      height: WindowHeight / 35.5031,
                      top: WindowHeight / 204.1428,
                    }}
                  >
                    <Image
                      style={{
                        height: "100%",
                        width: "100%",
                        resizeMode: "contain",
                      }}
                      source={require("../assets/Coin.png")}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: "insungitCutelivelyjisu",
                      fontSize: WindowWidth / 24.2016,
                    }}
                  >
                    {"x"}
                    {hintCost}
                  </Text>
                </View>
              </HintBtn>
              <FriendBtn
                style={{
                  transform: [{ scale: scaleFriendBtn }],
                }}
                onPressIn={() => {
                  scaleFriendBtn.setValue(0.9);
                  clickSoundPlay();
                }}
                onPressOut={() => {
                  scaleFriendBtn.setValue(1);
                  setShareModalVisible(true);
                }}
              >
                <Text
                  style={{
                    fontFamily: "insungitCutelivelyjisu",
                    fontSize: WindowWidth / 27.4285,
                  }}
                >
                  {"친구 찬스"}
                </Text>
              </FriendBtn>
            </HintsContainer>
            <AdsContainer>
              {bannerShow ? (
                <BannerAd
                  unitId={bannerAdUnitId}
                  size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                  requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                  }}
                />
              ) : null}
            </AdsContainer>
          </WindowContainer>
        </SafeAreaView>
      </TouchableWithoutFeedback>
      <Modal
        isVisible={isShopModalVisible}
        backdropOpacity={0.4}
        useNativeDriver={true}
        animationIn={"pulse"}
        animationOut={"zoomOut"}
        onBackdropPress={() => {
          setShopModalVisible(false);
        }}
        onBackButtonPress={() => {
          setShopModalVisible(false);
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
      <Modal
        isVisible={isSelectModalVisible}
        backdropOpacity={0.3}
        useNativeDriver={true}
        animationIn={"pulse"}
        onBackButtonPress={() => {
          interShow();
          goBack();
        }}
      >
        <SelectModal>
          <ModalText>{"정답입니다!"}</ModalText>
          <ModalBtnContainer>
            <PressView
              style={{
                transform: [{ scale: scaleHomeBtn }],
              }}
              onPressIn={() => {
                clickSoundPlay();
                scaleHomeBtn.setValue(0.9);
              }}
              onPressOut={() => {
                scaleHomeBtn.setValue(1);
                interShow();
              }}
            >
              <Shadow
                distance={3}
                startColor={"#00000020"}
                finalColor={"#ffbcbcbc"}
                offset={[15, 3]}
                style={styles.selectBoxShadow}
              >
                <ModalBtnText>{"첫화면"}</ModalBtnText>
              </Shadow>
            </PressView>
            {stage != 100 ? (
              <PressView
                style={{
                  transform: [{ scale: scaleNextBtn }],
                }}
                onPressIn={() => {
                  clickSoundPlay();
                  scaleNextBtn.setValue(0.9);
                }}
                onPressOut={() => {
                  scaleNextBtn.setValue(1);
                  nextStage();
                }}
              >
                <Shadow
                  distance={1}
                  startColor={"#00000020"}
                  finalColor={"#ffbcbcbc"}
                  offset={[15, 3]}
                  style={styles.selectBoxShadow}
                >
                  <ModalBtnText>다음</ModalBtnText>
                </Shadow>
              </PressView>
            ) : null}
          </ModalBtnContainer>
        </SelectModal>
      </Modal>
      <Modal
        isVisible={isFalseModalVisible}
        backdropOpacity={0}
        useNativeDriver={true}
        animationIn={"pulse"}
      >
        <FalseModal>
          <ModalText>{"땡!"}</ModalText>
        </FalseModal>
      </Modal>
      <Modal
        isVisible={isShareModalVisible}
        backdropOpacity={0.3}
        useNativeDriver={true}
        animationIn={"pulse"}
        onBackdropPress={() => {
          setShareModalVisible(false);
        }}
        onBackButtonPress={() => {
          setShareModalVisible(false);
        }}
      >
        <ShareModal>
          <ViewShot
            style={{
              width: WindowWidth / 1.21,
              alignItems: "center",
              backgroundColor: "lightcoral",
            }}
            ref={ref}
            options={{
              fileName: "Your-File-Name",
              format: "png",
              quality: 0.9,
            }}
          >
            <View
              style={{
                backgroundColor: "blue",
                width: WindowWidth / 1.5,
                height: WindowWidth / 1.5,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: WindowHeight / 80,
                marginTop: WindowHeight / 80,
              }}
            >
              <Image
                style={{
                  height: "100%",
                  width: "100%",
                  resizeMode: "contain",
                }}
                source={problemList[stage].imgBlur}
                borderRadius={10}
              />
            </View>

            <ShareHint
              style={
                hintText.length > 6
                  ? { flexWrap: "wrap", paddingTop: WindowHeight / 40.8285 }
                  : null
              }
            >
              {hintText.length != 0
                ? hintText.map((text, index) => {
                    return (
                      <Shadow
                        distance={1}
                        startColor={"#00000020"}
                        finalColor={"#ffbcbcbc"}
                        offset={[5, 8]}
                        style={styles.wordBoxShadow}
                        key={index}
                      >
                        <HintText>{text}</HintText>
                      </Shadow>
                    );
                  })
                : null}
            </ShareHint>
            {hideShareBtn ? null : (
              <ShareBtn
                style={{
                  transform: [{ scale: scaleShareBtn }],
                }}
                onPressIn={() => {
                  clickSoundPlay();
                  scaleShareBtn.setValue(0.9);
                }}
                onPressOut={() => {
                  setHideShareBtn(true);
                  onShot();
                  scaleShareBtn.setValue(1);
                }}
              >
                <Text
                  style={{ fontFamily: "insungitCutelivelyjisu", fontSize: 16 }}
                >
                  {"보내기"}
                </Text>
              </ShareBtn>
            )}
          </ViewShot>
        </ShareModal>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default withIAPContext(Quiz);

const WindowContainer = styled.View`
  flex: 1;
  background-color: slateblue;
`;
const Header = styled.View`
  flex: 0.065;
  background-color: slateblue;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;
const ShopView = styled.View`
  background-color: white;
  width: ${WindowWidth / 3.5776}px;
  height: ${WindowHeight / 27.219}px;
  border-radius: ${WindowWidth / 16.4571}px;
  align-items: center;
  position: absolute;
  left: ${WindowWidth / 41.1428}px;
  flex-direction: row;
`;
const ShopTextView = styled.View`
  width: ${WindowWidth / 4.6753}px;
  height: ${WindowHeight / 27.219}px;
  justify-content: center;
  align-items: center;
`;
const ShopBtn = styled.TouchableOpacity`
  //background-color: red;
  width: ${WindowWidth / 9.1428}px;
  height: ${WindowHeight / 18.146}px;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0px;
`;
const ShopModal = styled.View`
  background-color: lightcoral;
  width: ${WindowWidth / 1.371}px;
  height: ${WindowHeight / 1.633}px;
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
  //margin-top: 10px;
  //background-color: white;
  width: ${WindowWidth / 1.645}px;
  height: ${WindowHeight / 2.041}px;
  align-self: center;
  justify-content: space-evenly;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ShopModalContents = styled.View`
  background-color: #80f0f0;
  width: ${WindowWidth / 1.645}250px;
  height: ${WindowHeight / 8.165}px;
  align-items: center;
  justify-content: space-evenly;
  border-radius: ${WindowWidth / 16.4571}px;
  flex-direction: row;
`;
const ShopModalContentsTextContainer = styled.View`
  // background-color: white;
  width: ${WindowWidth / 2.7428}px;
  height: ${WindowHeight / 8.165}px;
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
  width: ${WindowWidth / 5.8775}70px;
  height: ${WindowHeight / 11.6653}70px;
  border-radius: ${WindowWidth / 20.5714}20px;
  justify-content: center;
  align-items: center;
`;
const StageView = styled.View`
  background-color: lightseagreen;
  border-radius: ${WindowWidth / 16.4571}px;
  width: ${WindowWidth / 5.8775}px;
  height: ${WindowHeight / 20.4142}px;
  justify-content: center;
  align-items: center;
`;
const CoinView = styled.View`
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
const QuizContainer = styled.View`
  flex: 0.45;
  padding-top: ${WindowHeight / 54.438}px;
  background-color: slateblue;
  align-items: center;
`;
const AnswerContainer = styled.View`
  flex: 0.1;
  width: ${WindowWidth * 0.9}px;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  align-self: center;
`;
const AnswerInput = styled.TextInput`
  background-color: white;
  border-radius: ${WindowWidth / 41.1428}px;
  padding: 10px 20px;
  font-size: ${WindowWidth / 22.8571}px;
`;
const HintsContainer = styled.View`
  flex: 0.35;
  background-color: slateblue;
  justify-content: space-evenly;
  align-items: center;
`;

const HintView = styled.View`
  flex: 0.7;
  background-color: white;
  width: ${WindowWidth * 0.9}px;
  border-radius: ${WindowWidth / 27.4285}px;
  justify-content: center;
  flex-direction: row;
  align-items: center;
`;
const HintText = styled.Text`
  font-size: ${WindowWidth / 16.4571}px;
  font-family: insungitCutelivelyjisu;
`;
const HintBtn = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: lightseagreen;
  width: ${WindowWidth / 4.5714}90px;
  height: ${WindowHeight / 12.5626}65px;
  border-radius: ${WindowWidth / 16.4571}px;
  align-self: center;
  align-items: center;
  justify-content: center;
`;
const FriendBtn = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: orange;
  position: absolute;
  right: ${WindowWidth / 41.1428}px;
  bottom: 0px;
  width: ${WindowWidth / 5.8775}px;
  height: ${WindowHeight / 16.3314}px;
  border-radius: ${WindowWidth / 16.4571}px;
  align-items: center;
  justify-content: center;
`;
const AdsContainer = styled.View`
  flex: 0.1;
  background-color: slateblue;
  align-items: center;
  justify-content: flex-end;
`;
const RewardAdsButton = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: lightseagreen;
  border-radius: ${WindowWidth / 16.4571}px;
  width: ${WindowWidth / 5.1428}px;
  height: ${WindowHeight / 13.6095}px;
  position: absolute;
  bottom: ${WindowHeight / 163.3142}px;
  right: ${WindowWidth / 82.2857}px;
  justify-content: center;
  align-items: center;
`;
const SelectModal = styled.View`
  background-color: lightcoral;
  width: ${WindowWidth / 1.3714}px;
  height: ${WindowHeight / 4.0828}px;
  align-self: center;
  align-items: center;
  justify-content: center;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ModalBtnContainer = styled.View`
  flex-direction: row;
  margin-top: ${WindowHeight / 27.219}30px;
`;
const FalseModal = styled.View`
  background-color: lightcoral;
  width: ${WindowWidth / 2.0571}px;
  height: ${WindowHeight / 5.4438}0px;
  align-self: center;
  align-items: center;
  justify-content: center;
  border-radius: ${WindowWidth / 16.4571}px;
`;
const ShareModal = styled.View`
  background-color: lightcoral;
  width: ${WindowWidth / 1.1755}350px;
  align-self: center;
  align-items: center;
  border-radius: ${WindowWidth / 16.4571}px;
  padding-vertical: ${WindowHeight / 40.8285}20px;
`;
const ShareHint = styled.View`
  //background-color: blue;
  border-radius: ${WindowWidth / 20.5714}20px;
  width: ${WindowWidth / 1.3714}px;
  justify-content: center;
  flex-direction: row;
`;
const ShareBtn = styled(Animated.createAnimatedComponent(Pressable))`
  background-color: skyblue;
  border-radius: ${WindowWidth / 16.4571}px;
  width: ${WindowWidth / 5.8775}70px;
  height: ${WindowHeight / 16.3314}px;
  align-items: center;
  justify-content: center;
  margin-top: ${WindowHeight / 54.438}px;
`;
const ModalText = styled.Text`
  font-size: ${WindowWidth / 13.7142}px;
  font-family: insungitCutelivelyjisu;
`;
const ModalBtnText = styled.Text`
  font-size: ${WindowWidth / 27.4285}px;
  font-family: insungitCutelivelyjisu;
`;

const PressView = styled(Animated.createAnimatedComponent(Pressable))``;

const styles = StyleSheet.create({
  wordBoxShadow: {
    backgroundColor: "white",
    width: WindowWidth / 9.1428,
    height: WindowWidth / 9.1428,
    borderRadius: 10,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: WindowWidth / 82.2857,
    marginVertical: WindowHeight / 163.3142,
  },

  selectBoxShadow: {
    backgroundColor: "white",
    width: WindowWidth / 4.1142,
    height: WindowHeight / 14.8467,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: WindowWidth / 27.4285,
  },
});
