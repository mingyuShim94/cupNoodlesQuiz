import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { Audio } from 'expo-av';
const Home = ({ navigation: { navigate } }) => {
  const [bgmSound, setBgmSound] = useState();
  const [clickSound, setClickSound] = useState();

  const bgmSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/backgroundMusic.mp3')
    );
    sound.setIsLoopingAsync(true);
    setBgmSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  };

  const clickSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/click.mp3')
    );
    setClickSound(sound);

    console.log('Playing Sound');
    await sound.playAsync();
  };
  useEffect(() => {
    return bgmSound
      ? () => {
          console.log('Unloading Sound');
          bgmSound.unloadAsync();
        }
      : undefined;
  }, [bgmSound]);

  useEffect(() => {
    bgmSoundPlay();
  }, []);
  return (
    <WindowContainer>
      <StatusBar style="light" backgroundColor="black" />
      <GameTitleContainer>
        <GameTitle>컵라면 퀴즈</GameTitle>
      </GameTitleContainer>
      <GameBtnContainer>
        <GameBtn
          onPress={() => {
            clickSoundPlay();
            navigate('StageSelect');
          }}>
          <GameBtnText>게임시작</GameBtnText>
        </GameBtn>
      </GameBtnContainer>
      <AdsContainer>
        <AdMobBanner
          bannerSize="fullBanner"
          adUnitID="ca-app-pub-3940256099942544/6300978111" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds // true or false
          onDidFailToReceiveAdWithError={this.bannerError}
        />
      </AdsContainer>
    </WindowContainer>
  );
};
export default Home;

const WindowContainer = styled.View`
  flex:1;
  background-color:white;
`;
const GameTitleContainer = styled.View`
  flex:0.5;
  background-color:red;
  align-items:center;
`;
const GameTitle = styled.Text`
  marginTop:250px;
  fontSize:50px;
`;
const GameBtnContainer = styled.View`
  flex:0.5;
  background-color:blue;
  align-items:center;
  paddingTop:50px;
`;
const GameBtn = styled.TouchableOpacity`
  background-color:pink;
  width:150px;
  height:80px;
  border-radius:20px;
  marginVertical:20px;
  align-items:center;
  justify-content:center;
`;
const GameBtnText = styled.Text`
  fontSize:25px;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
`;
