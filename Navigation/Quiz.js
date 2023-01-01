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
  Pressable,
  Image,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Shadow } from 'react-native-shadow-2';
import styled from 'styled-components/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
const WindowHeight = Dimensions.get('window').height;
const WindowWidth = Dimensions.get('window').width;
const STORAGE_KEY_COIN = '@my_coins';
const STORAGE_KEY_RECORD = '@my_record';
import problemList from '../assets/problemList';
import hintInitialList from '../assets/hintInitialList';
import { useFonts } from 'expo-font';
import { Octicons } from '@expo/vector-icons';
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
  const [fontsLoaded] = useFonts({
    appFont: require('../assets/font1.ttf'),
  });
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
  const [isSelectModalVisible, setSelectModalVisible] = useState(false);
  const [isFalseModalVisible, setFalseModalVisible] = useState(false);
  const [myAnswer, setMyAnswer] = useState('');
  const [coin, setCoin] = useState(0);
  const [blur, setBlur] = useState(true);
  const scaleHintBtn = useRef(new Animated.Value(1)).current;
  const scaleNextBtn = useRef(new Animated.Value(1)).current;
  const scaleHomeBtn = useRef(new Animated.Value(1)).current;
  const scaleAdsBtn = useRef(new Animated.Value(1)).current;
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
        setSelectModalVisible(true),
        storeRecordData(),
        setBlur(false))
      : (wrongSoundPlay(),
        setMyAnswer(''),
        setFalseModalVisible(true),
        setTimeout(() => {
          setFalseModalVisible(false);
        }, 500));
  };

  const nextStage = () => {
    setSelectModalVisible(false);
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
    await AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917'); // Test ID, Replace with your-admob-unit-id
    await AdMobRewarded.requestAdAsync();
    await AdMobRewarded.showAdAsync();
    AdMobRewarded.addEventListener('rewardedVideoUserDidEarnReward', () => {
      setCoin((prev) => prev + 50);
      coinData.current += 50;
      storeCoinData();
    });
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
                <Text style={{ fontFamily: 'appFont', fontSize: 17 }}>
                  {stage + 1}탄
                </Text>
              </StageView>
              <CoinView>
                <Image
                  style={{
                    height: '100%',
                    width: '100%',
                    resizeMode: 'contain',
                    position: 'absolute',
                    right: 35,
                    zIndex: 1,
                    top: 2,
                  }}
                  source={require('../assets/Coin.png')}
                />
                <CoinTextView>
                  <Text style={{ fontFamily: 'appFont', fontSize: 13 }}>
                    {coin}
                  </Text>
                </CoinTextView>
              </CoinView>
            </Header>
            <QuizContainer>
              <Image
                style={{ height: '95%', width: '95%', resizeMode: 'contain' }}
                source={
                  blur == true
                    ? problemList[stage].imgBlur
                    : problemList[stage].img
                }
                borderRadius={10}
              />
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
                  onRewardPress();
                }}>
                <Text style={{ fontFamily: 'appFont', fontSize: 17 }}>
                  돈내놔
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Octicons name="video" size={27} color="red" />
                </View>
              </RewardAdsButton>
            </QuizContainer>
            <AnswerContainer>
              <AnswerInput
                placeholder="무슨 컵라면 일까요?"
                onChangeText={(newText) => setMyAnswer(newText)}
                value={myAnswer}
                onSubmitEditing={() => checkAnswer()}
                style={{ fontFamily: 'appFont' }}
              />
            </AnswerContainer>
            <HintsContainer>
              <HintView
                style={
                  hintText.length > 6
                    ? { flexWrap: 'wrap', paddingTop: 20 }
                    : null
                }>
                {hintText.length != 0
                  ? hintText.map((text) => {
                      return (
                        <Shadow
                          distance={1}
                          startColor={'#00000020'}
                          finalColor={'#ffbcbcbc'}
                          offset={[5, 8]}
                          style={styles.wordBoxShadow}>
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
                <Text style={{ fontFamily: 'appFont', fontSize: 17 }}>
                  힌트줘
                </Text>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={{ fontFamily: 'appFont', fontSize: 17, right: 2 }}>
                    10
                  </Text>
                  <View style={{ width: 23, height: 23, top: 4, left: 3 }}>
                    <Image
                      style={{
                        height: '100%',
                        width: '100%',
                        resizeMode: 'contain',
                      }}
                      source={require('../assets/Coin.png')}
                    />
                  </View>
                </View>
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
      <Modal
        isVisible={isSelectModalVisible}
        backdropOpacity={0}
        useNativeDriver={true}
        animationIn={'pulse'}
        onBackButtonPress={goBack}>
        <SelectModal>
          <ModalText>정답입니다!</ModalText>
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
                goBack();
              }}>
              <Shadow
                distance={3}
                startColor={'#00000020'}
                finalColor={'#ffbcbcbc'}
                offset={[15, 3]}
                style={styles.selectBoxShadow}>
                <ModalBtnText>첫화면</ModalBtnText>
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
                }}>
                <Shadow
                  distance={1}
                  startColor={'#00000020'}
                  finalColor={'#ffbcbcbc'}
                  offset={[15, 3]}
                  style={styles.selectBoxShadow}>
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
        animationIn={'pulse'}>
        <FalseModal>
          <ModalText>땡!</ModalText>
        </FalseModal>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default Quiz;

const WindowContainer = styled.View`
  flex:1;
  background-color:slateblue;
`;
const Header = styled.View`
  flex:0.065;
  background-color:slateblue;
  flex-direction:row;
  align-items:center;
  justify-content:center;
`;
const StageView = styled.View`
  background-color:lightseagreen;
  border-radius:25px;
  width:70px;
  height:40px;
  justify-content:center;
  align-items:center;
`;
const CoinView = styled.View`
  // background-color:red;
  // border-radius:25px;
  width:70px;
  height:40px;
  //justify-content:center;
  align-items:center;
  position:absolute;
  right:15px;
  flex-direction:row;
`;
const CoinTextView = styled.View`
  background-color:white;
  border-radius:25px;
  width:70px;
  height:30px;
  justify-content:center;
  align-items:flex-end;
  padding-right:15;
`;
const QuizContainer = styled.View`
  flex:0.45;
  background-color:slateblue;
  align-items:center;
`;
const AnswerContainer = styled.View`
  flex:0.1;
  width:${WindowWidth * 0.9};
  //background-color:burlywood;
  justify-content:center;
  align-items:center;
  flex-direction:row;
  align-self:center;
  borderRadius:10px;
`;
const AnswerInput = styled.TextInput`
  background-color:white;
  border-radius:10px;
  padding:10px 20px;
  font-size:18px
`;
const HintsContainer = styled.View`
  flex:0.35;
  background-color:slateblue;
  justifyContent: space-evenly;
  align-items:center;
`;
const HintView = styled.View`
  flex:0.7;
  background-color:white;
  width: ${WindowWidth * 0.9}
  //padding:10px;
  border-radius:15px;
  // borderWidth:3px;
  // borderColor:black;
  justify-content:center;
  flex-direction:row;
  align-items:center;
  
`;
const HintText = styled.Text`
  fontSize:25px;
  fontFamily:appFont;
`;
const HintBtn = styled(Animated.createAnimatedComponent(Pressable))`
  background-color:lightseagreen;
  width:80px;
  height:60px;
  border-radius:25px;
  // borderWidth:3px;
  // borderColor:black;
  align-self:center;
  align-items:center;
  justify-content:center;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
`;
const RewardAdsButton = styled(Animated.createAnimatedComponent(Pressable))`
  background-color:lightseagreen;
  border-radius:25px;
  width:80px;
  height:60px;
  position:absolute;
  bottom : 5px;
  right : 5px;
  // borderWidth:3px;
  // borderColor:black;
  justify-content:center;
  align-items:center;
`;
const SelectModal = styled.View`
  background-color:lightcoral;
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
const FalseModal = styled.View`
  background-color:lightcoral;
  width:200px;
  height:150px;
  alignSelf:center;
  align-items:center;
  justify-content:center;
  border-radius:25px;
`;
const ModalText = styled.Text`
  fontSize: 30px;
  fontFamily:appFont;
`;
const ModalBtnText = styled.Text`
  fontSize: 15px;
  fontFamily:appFont;
`;
const PressView = styled(Animated.createAnimatedComponent(Pressable))``;

const styles = StyleSheet.create({
  wordBoxShadow: {
    backgroundColor: 'white',
    width: 45,
    height: 45,
    borderRadius: 10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
  },

  selectBoxShadow: {
    backgroundColor: 'white',
    width: 100,
    height: 55,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
});
