import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Button,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import styled from 'styled-components/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const WindowHeight = Dimensions.get('window').height;
const WindowWidth = Dimensions.get('window').width;
const STORAGE_KEY = '@my_coins';
import { FontAwesome } from '@expo/vector-icons';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import Modal from 'react-native-modal';

const problemList = [
  { text: '신라면', img: require('../assets/shin.jpg') },
  { text: '불닭볶음면', img: require('../assets/buldak.jpg') },
];
const hintList = [
  { initial: 'ㅅㄹㅁ', association: '고구려백제ㅇㅇ' },
  { initial: 'ㅂㄷㅂㅇㅁ', association: '투블럭 암탉' },
];
const Quiz = ({ route }) => {
  //console.info(route.params.stageIndex);
  const bannerRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [stage, setStage] = useState(route.params.stageIndex);
  const [blur, setBlur] = useState(true);
  const [coin, setCoin] = useState(0);
  const coinData = useRef(0);
  const scale1 = useRef(new Animated.Value(1)).current;
  const position1 = useRef(new Animated.Value(0)).current;
  const onPressOut1 = Animated.spring(scale1, {
    toValue: 1,
    useNativeDriver: true,
  });
  const onPressIn1 = Animated.spring(scale1, {
    toValue: 0.95,
    useNativeDriver: true,
  });
  const goCenter1 = Animated.spring(position1, {
    toValue: 0,
    useNativeDriver: true,
  });
  const goLeft1 = Animated.spring(position1, {
    toValue: -500,
    tension: 5,
    useNativeDriver: true,
    restDisplacementThreshold: 200,
    restSpeedThreshold: 200,
  });
  const goRight1 = Animated.spring(position1, {
    toValue: 500,
    tension: 5,
    useNativeDriver: true,
    restDisplacementThreshold: 200,
    restSpeedThreshold: 200,
  });
  const useCoin = () => {
    setCoin((prev) => prev - 10);
    coinData.current -= 10;
    storeCoinData();
  };
  const reCover = () => {
    position1.setValue(0);
    position2.setValue(0);
    scale1.setValue(1);
    scale2.setValue(1);
  };
  const panResponder1 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx }) => {
        position1.setValue(dx);
      },
      onPanResponderGrant: () => onPressIn1.start(),
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -100) {
          goLeft1.start(useCoin);
        } else if (dx > 100) {
          goRight1.start(useCoin);
        } else {
          Animated.parallel([onPressOut1, goCenter1]).start();
        }
      },
    })
  ).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const position2 = useRef(new Animated.Value(0)).current;
  const onPressOut2 = Animated.spring(scale2, {
    toValue: 1,
    useNativeDriver: true,
  });
  const onPressIn2 = Animated.spring(scale2, {
    toValue: 0.95,
    useNativeDriver: true,
  });
  const goCenter2 = Animated.spring(position2, {
    toValue: 0,
    useNativeDriver: true,
  });
  const goLeft2 = Animated.spring(position2, {
    toValue: -500,
    tension: 5,
    useNativeDriver: true,
    restDisplacementThreshold: 200,
    restSpeedThreshold: 200,
  });
  const goRight2 = Animated.spring(position2, {
    toValue: 500,
    tension: 5,
    useNativeDriver: true,
    restDisplacementThreshold: 200,
    restSpeedThreshold: 200,
  });
  const panResponder2 = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, { dx }) => {
        position2.setValue(dx);
      },
      onPanResponderGrant: () => onPressIn2.start(),
      onPanResponderRelease: (_, { dx }) => {
        if (dx < -100) {
          goLeft2.start(useCoin);
        } else if (dx > 100) {
          goRight2.start(useCoin);
        } else {
          Animated.parallel([onPressOut2, goCenter2]).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    //load();
    getCoinData();
  }, []);
  const load = async () => {
    await setTestDeviceIDAsync('EMULATOR');
  };
  const storeCoinData = async () => {
    //console.info(coinData.current);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(coinData.current));
    } catch (e) {
      alert(e);
    }
  };
  const getCoinData = async () => {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEY);
      //console.info(value);
      if (value == null) {
        setCoin(0);
        coinData.current = 0;
      } else {
        setCoin(JSON.parse(value));
        coinData.current = JSON.parse(value);
      }
    } catch (e) {
      alert(e);
    }
  };
  const checkAnswer = () => {
    myAnswer == problemList[stage].text
      ? (setBlur(false), setModalVisible(true))
      : (alert('오답'), setMyAnswer(''));
  };
  const nextStage = () => {
    setModalVisible(false);
    setMyAnswer('');
    setBlur(true);
    setStage((prev) => prev + 1);
    reCover();
  };
  const onRewardPress = async () => {
    // await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917'); // Test ID, Replace with your-admob-unit-id
    // await AdMobRewarded.requestAdAsync();
    // await AdMobRewarded.showAdAsync();
    // AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
    //   setCoin((prev) => prev + 50);
    //   storeCoinData();
    // });
    setCoin((prev) => prev + 50);
    coinData.current += 50;
    storeCoinData();
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      enabled={false}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <WindowContainer>
          <QuizContainer>
            <Image
              style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
              source={problemList[stage].img}
              blurRadius={blur == true ? 5 : 0}
            />
            <RewardAdsButton onPress={() => onRewardPress()}>
              <Text>돈내놔</Text>
            </RewardAdsButton>
            <CoinView>
              <Text>{coin}</Text>
            </CoinView>
          </QuizContainer>
          <AnswerContainer>
            <AnswerInput
              placeholder="무슨 컵라면 일까요?"
              onChangeText={(newText) => setMyAnswer(newText)}
              value={myAnswer}
              onSubmitEditing={() => checkAnswer()}
            />
          </AnswerContainer>
          <HintsContainer>
            <HintView>
              <HintTextStyle>{hintList[stage].initial}</HintTextStyle>
              <HintCover
                {...panResponder1.panHandlers}
                style={{
                  transform: [{ scale: scale1 }, { translateX: position1 }],
                }}>
                <HintButton>
                  <FontAwesome name="lock" size={35} color="black" />
                </HintButton>
                <HintTextStyle>초성힌트</HintTextStyle>
              </HintCover>
            </HintView>
            <HintView>
              <HintTextStyle>{hintList[stage].association}</HintTextStyle>
              <HintCover
                {...panResponder2.panHandlers}
                style={{
                  transform: [{ scale: scale2 }, { translateX: position2 }],
                }}>
                <HintButton>
                  <FontAwesome name="lock" size={35} color="black" />
                </HintButton>
                <HintTextStyle>한글자힌트</HintTextStyle>
              </HintCover>
            </HintView>
          </HintsContainer>
          <AdsContainer>
            <AdMobBanner
              bannerSize="fullBanner"
              adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
              servePersonalizedAds // true or false
              onDidFailToReceiveAdWithError={this.bannerError}
            />
          </AdsContainer>
        </WindowContainer>
      </TouchableWithoutFeedback>
      <Modal isVisible={isModalVisible}>
        <SelectModal>
          <ModalText>정답입니다!</ModalText>
          <ModalBtnContainer>
            <ModalBtn>
              <ModalBtnText>첫화면</ModalBtnText>
            </ModalBtn>
            <ModalBtn onPress={nextStage}>
              <ModalBtnText>다음</ModalBtnText>
            </ModalBtn>
          </ModalBtnContainer>
        </SelectModal>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Quiz;

const WindowContainer = styled.View`
  flex:1;
  background-color:blue;
`;
const QuizContainer = styled.View`
  flex:0.5;
  background-color:red;
`;
const AnswerContainer = styled.View`
  flex:0.1;
  background-color:yellow;
  justify-content:center;
  align-items:center;
  flex-direction:row;
`;
const AnswerInput = styled.TextInput`
  background-color:white;
  border-radius:10px;
  padding:10px 20px;
  font-size:18px
`;
const HintsContainer = styled.View`
  flex:0.3;
  background-color:skyblue;
  justify-content:center;
  align-items:center;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
`;
const HintView = styled.View`
  background-color:white;
  border-radius:20px;
  width: 250px;
  height:80px;
  marginVertical:10px;
  justify-content:center;
  align-items:center;
`;
const HintTextStyle = styled.Text`
  fontSize: 30px;
`;
const HintButton = styled.View`
  //background-color:blue;
  border-radius:10px;
  width:50px;
  height:50px;
  position:absolute;
  left:0px;
  justify-content:center;
  align-items:center;
`;
const RewardAdsButton = styled.TouchableOpacity`
  background-color:pink;
  border-radius:25px;
  width:50px;
  height:50px;
  position:absolute;
  bottom : 5px;
  right : 5px;
  justify-content:center;
  align-items:center;
`;
const SelectModal = styled.View`
  background-color:red;
  width:300px;
  height:200px;
  alignSelf:center;
  align-items:center;
  justify-content:center;
  border-radius:25px;
`;
const ModalBtnContainer = styled.View`
  flex-direction:row;
  marginTop:30px;
`;
const ModalText = styled.Text`
  fontSize: 30px;
`;
const ModalBtnText = styled.Text`
  fontSize: 15px;
`;
const ModalBtn = styled.TouchableOpacity`
  background-color:white;
  width:100px;
  height:55px;
  border-radius:30px;
  marginHorizontal:15px;
  justify-content:center;
  align-items:center;
`;
const CoinView = styled.View`
  background-color:red;
  border-radius:25px;
  width:70px;
  height:40px;
  position:absolute;
  top:30px;
  right:15px;
  justify-content:center;
  align-items:center;
`;
const HintCover = styled(Animated.createAnimatedComponent(View))`
  background-color:purple;
  border-radius:20px;
  width: 250px;
  height:80px;
  justify-content:center;
  align-items:center;
  position:absolute;
`;
