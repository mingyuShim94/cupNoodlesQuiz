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
} from 'react-native';
import styled from 'styled-components/native';
const WindowHeight = Dimensions.get('window').height;
const WindowWidth = Dimensions.get('window').width;
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
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
const HintButton = styled.View`
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
const Quiz = () => {
  const bannerRef = useRef(null);
  const [myAnswer, setMyAnswer] = useState('');
  const [answer, setAnswer] = useState('신라면');
  const load = async () => {
    await setTestDeviceIDAsync('EMULATOR');
  };
  useEffect(() => {
    load();
  }, []);
  const checkAnswer = () => {
    myAnswer == answer ? alert('정답') : (alert('오답'), setMyAnswer(''));
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
              source={require('./assets/shin.jpg')}
              blurRadius={5}
            />
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
            <HintButton>
              <HintTextStyle>ㅅㄹㅁ</HintTextStyle>
            </HintButton>
            <HintButton>
              <HintTextStyle>고구려백제OO</HintTextStyle>
            </HintButton>
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
    </KeyboardAvoidingView>
  );
};

export default Quiz;
