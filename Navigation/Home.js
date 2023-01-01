import React, { useEffect, useState, useRef } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Animated,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import styled from 'styled-components/native';
import { StatusBar } from 'expo-status-bar';
import tinycolor from 'tinycolor2';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
import { Audio } from 'expo-av';
import { Shadow } from 'react-native-shadow-2';
import { useFonts } from 'expo-font';
const Home = ({ navigation: { navigate } }) => {
  const [fontsLoaded] = useFonts({
    appFont: require('../assets/font1.ttf'),
  });
  const [bgmSound, setBgmSound] = useState();
  const [clickSound, setClickSound] = useState();
  const scale = useRef(new Animated.Value(1)).current;

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
  //
  const clickSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/popClick.wav')
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
    //bgmSoundPlay();
  }, []);
  return (
    <WindowContainer>
      <StatusBar style="light" backgroundColor="black" />
      <GameTitleContainer>
        <GameTitle>컵라면 101</GameTitle>
      </GameTitleContainer>
      <GameBtnContainer>
        <PressView
          style={{
            transform: [{ scale }],
          }}
          touchSoundDisabled={true}
          onPressIn={() => {
            scale.setValue(0.9);
            clickSoundPlay();
          }}
          onPressOut={() => {
            scale.setValue(1);
            navigate('StageSelect');
          }}>
          <Shadow
            distance={3}
            startColor={'#00000020'}
            finalColor={'#ffbcbcbc'}
            offset={[0, 5]}
            style={styles.boxShadow}>
            <GameBtnText>게임시작</GameBtnText>
          </Shadow>
        </PressView>
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
  paddingTop:200;
  flex:0.5;
  background-color:slateblue;
  align-items:center;
  justify-content:center;
`;
const GameTitle = styled.Text`
  fontFamily:appFont;
  fontSize:50px;
`;
const GameBtnContainer = styled.View`
  flex:0.5;
  background-color:slateblue;
  align-items:center;
  paddingTop:50px;
`;
const PressView = styled(Animated.createAnimatedComponent(Pressable))`
`;
const GameBtnText = styled.Text`
  fontFamily:appFont;
  fontSize:25px;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
`;
const styles = StyleSheet.create({
  boxShadow: {
    backgroundColor: 'white',
    width: 120,
    height: 70,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
