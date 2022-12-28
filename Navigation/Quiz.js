import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
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
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
const WindowHeight = Dimensions.get('window').height;
const WindowWidth = Dimensions.get('window').width;
const STORAGE_KEY_COIN = '@my_coins';
const STORAGE_KEY_RECORD = '@my_record';
import problemList from '../assets/problemList';
import hintInitialList from '../assets/hintInitialList';
import { FontAwesome } from '@expo/vector-icons';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { Audio } from 'expo-av';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
//
const tempHintInitialList = Array.from(hintInitialList);
const Quiz = ({ route, navigation: { goBack } }) => {
  const [trueSound, setTrueSound] = useState();
  const [wrongSound, setWrongSound] = useState();
  const [clickSound, setClickSound] = useState();
  const bannerRef = useRef(null);
  const [stage, setStage] = useState(route.params.stageIndex);
  const [hintLevel, setHintLevel] = useState(false);
  const [hintText, setHintText] = useState('');
  const [hintIndex, setHintIndex] = useState(
    Array.from({ length: tempHintInitialList[stage].length }, (v, i) => i)
  );
  const [isModalVisible, setModalVisible] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [blur, setBlur] = useState(true);
  const [coin, setCoin] = useState(0);
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const coinData = useRef(0);
  const coinUse = () => {
    setCoin((prev) => prev - 10);
    coinData.current -= 10;
    storeCoinData();
  };
  useEffect(() => {
    setHintIndex(() =>
      Array.from({ length: tempHintInitialList[stage].length }, (v, i) => i)
    );
  }, [stage]);
  useEffect(() => {
    //load();
    getCoinData();
    getRecordData();
  }, []);
  const trueSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/true.wav')
    );
    setTrueSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  };
  const wrongSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/wrong.wav')
    );
    setWrongSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  };

  const clickSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/hintClick.mp3')
    );
    setClickSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  };

  const load = async () => {
    await setTestDeviceIDAsync('EMULATOR');
  };
  const storeCoinData = async () => {
    //console.info(coinData.current);
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

  const checkAnswer = () => {
    myAnswer == problemList[stage].text
      ? (trueSoundPlay(),
        setBlur(false),
        setModalVisible(true),
        storeRecordData())
      : (wrongSoundPlay(), setMyAnswer(''));
  };

  const nextStage = () => {
    setModalVisible(false);
    setMyAnswer('');
    setBlur(true);
    setHintText('');
    setHintLevel(false);
    setStage((prev) => prev + 1);
  };

  const giveHint = () => {
    if (hintLevel == false) {
      setHintText(tempHintInitialList[stage]);
      setHintLevel(true);
    } else {
      if (hintIndex.length != 0) {
        const randIdx = Math.floor(Math.random() * hintIndex.length); //[0,1,2]에서 1뽑음   //1뽑음    //0뽑음
        const selIdx = hintIndex[randIdx]; //1     //2    //0
        let temp = Array.from(hintText);
        temp[selIdx] = problemList[stage].text[selIdx]; //ㅅ라ㅁ     //ㅅ라면    //신라면
        //console.info('hintInitialList', hintInitialList[0]);
        hintIndex.splice(randIdx, 1); //[0,2]    //[0]    //[]
        setHintText(temp);
        console.info('randIdx', randIdx);
        console.info('selIdx', selIdx);
        console.info('hintIndex', hintIndex);
        console.info('hintText', temp);
      }
    }
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
        <SafeAreaView style={{ flex: 1 }}>
          <WindowContainer>
            <StatusBar style="light" backgroundColor="black" />
            <Header>
              <StageView>
                <Text>{stage + 1}탄</Text>
              </StageView>
              <CoinView>
                <Text>{coin}</Text>
              </CoinView>
            </Header>
            <QuizContainer>
              <Image
                style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
                source={problemList[stage].img}
                blurRadius={blur == true ? 6 : 0}
              />
              <RewardAdsButton onPress={() => onRewardPress()}>
                <Text>돈내놔</Text>
              </RewardAdsButton>
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
                <HintText>{hintText}</HintText>
              </HintView>
              <HintBtn
                onPress={() => {
                  clickSoundPlay();
                  if (hintIndex.length != 0) {
                    if (coin != 0) {
                      coinUse();
                      giveHint();
                    } else {
                      console.info('돈없다!');
                    }
                  } else {
                    console.info('힌트다줌!');
                  }
                }}>
                <Text>힌트줘</Text>
              </HintBtn>
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
        </SafeAreaView>
      </TouchableWithoutFeedback>
      <Modal isVisible={isModalVisible} backdropOpacity={0}>
        <SelectModal>
          <ModalText>정답입니다!</ModalText>
          <ModalBtnContainer>
            <ModalBtn
              onPress={() => {
                clickSoundPlay();
                goBack();
              }}>
              <ModalBtnText>첫화면</ModalBtnText>
            </ModalBtn>
            {stage != 100 ? (
              <ModalBtn onPress={nextStage}>
                <ModalBtnText>다음</ModalBtnText>
              </ModalBtn>
            ) : null}
          </ModalBtnContainer>
        </SelectModal>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Quiz;

const WindowContainer = styled.View`
  flex:1;
  background-color:white;
`;
const Header = styled.View`
  flex:0.065;
  background-color:green;
  flex-direction:row;
  align-items:center;
  justify-content:center;
`;
const StageView = styled.View`
  background-color:red;
  border-radius:25px;
  width:70px;
  height:40px;
  justify-content:center;
  align-items:center;
`;
const CoinView = styled.View`
  background-color:red;
  border-radius:25px;
  width:70px;
  height:40px;
  justify-content:center;
  align-items:center;
  position:absolute;
  right:15px;
`;
const QuizContainer = styled.View`
  flex:0.45;
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
  flex:0.35;
  background-color:skyblue;
  justifyContent: space-evenly;
`;
const HintView = styled.View`
  flex:0.7;
  background-color:white;
  marginHorizontal:10px;
  border-radius:15px;
  align-items:center;
  justify-content:center;
`;
const HintText = styled.Text`
  fontSize:25px;
`;
const HintBtn = styled.TouchableOpacity`
  background-color:green;
  width:80px;
  height:50px;
  border-radius:25px;
  align-self:center;
  align-items:center;
  justify-content:center;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
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
  top:110px;
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
