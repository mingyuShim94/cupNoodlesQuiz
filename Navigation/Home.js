import React, { useEffect, useState, useRef } from "react";
import { Animated, Pressable, StyleSheet, Image } from "react-native";
import styled from "styled-components/native";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Shadow } from "react-native-shadow-2";
import { AdMobBanner } from "expo-ads-admob";
import { Octicons } from "@expo/vector-icons";

const Home = ({ navigation: { navigate } }) => {
  const [bgmSound, setBgmSound] = useState();
  const [clickSound, setClickSound] = useState();
  const [cupOpen, setCupOpen] = useState(false);
  const [mute, setMute] = useState(false);
  const scaleStartBtn = useRef(new Animated.Value(1)).current;
  const scaleMuteBtn = useRef(new Animated.Value(1)).current;
  const bgmSoundPlay = async (mute) => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/backgroundMusic.mp3")
    );
    sound.setIsLoopingAsync(true);
    sound.setIsMutedAsync(!mute);
    setBgmSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };

  const clickSoundPlay = async () => {
    console.log("Loading Sound");
    const { sound } = await Audio.Sound.createAsync(
      require("../assets/Audio/popClick.wav")
    );
    setClickSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
  };

  useEffect(() => {
    return bgmSound
      ? () => {
          console.log("Unloading Sound");
          bgmSound.unloadAsync();
        }
      : undefined;
  }, [bgmSound]);
  useEffect(() => {
    return clickSound
      ? () => {
          console.log("Unloading Sound");
          clickSound.unloadAsync();
        }
      : undefined;
  }, [clickSound]);

  useEffect(() => {
    bgmSoundPlay(true);
  }, []);
  return (
    <WindowContainer>
      <StatusBar style="light" backgroundColor="black" />
      <GameTitleContainer>
        <SoundBtn
          style={{
            transform: [{ scale: scaleMuteBtn }],
          }}
          onPress={() => {
            setMute((prev) => !prev);
            bgmSoundPlay(mute);
          }}
        >
          {mute
            ? () => {
                scaleMuteBtn.setValue(0.8);
                return <Octicons name="mute" size={50} color="black" />;
              }
            : () => {
                scaleMuteBtn.setValue(1);
                return <Octicons name="unmute" size={50} color="black" />;
              }}
        </SoundBtn>
        <GameTitle>{"컵라면 101"}</GameTitle>
      </GameTitleContainer>
      <IllustContainer>
        {cupOpen == false ? (
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
              alignSelf: "center",
              left: 25,
            }}
            source={require("../assets/cupClose.png")}
          />
        ) : (
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
              alignSelf: "center",
              left: 25,
            }}
            source={require("../assets/cupOpen.png")}
          />
        )}
      </IllustContainer>
      <GameBtnContainer>
        <PressView
          style={{
            transform: [{ scale: scaleStartBtn }],
          }}
          touchSoundDisabled={true}
          onPressIn={() => {
            clickSoundPlay();
            scaleStartBtn.setValue(0.9);
            setCupOpen(true);
          }}
          onPress={() => {
            navigate("StageSelect");
          }}
          onPressOut={() => {
            scaleStartBtn.setValue(1);
            setCupOpen(false);
          }}
        >
          <Shadow
            distance={3}
            startColor={"#00000020"}
            finalColor={"#ffbcbcbc"}
            offset={[0, 5]}
            style={styles.boxShadow}
          >
            <GameBtnText>{"게임시작"}</GameBtnText>
          </Shadow>
        </PressView>
      </GameBtnContainer>
      <AdsContainer>
        <AdMobBanner
          bannerSize="banner"
          adUnitID="ca-app-pub-8647279125417942/6622534546" // Test ID, Replace with your-admob-unit-id
          servePersonalizedAds={true}
        />
      </AdsContainer>
    </WindowContainer>
  );
};
export default Home;

const WindowContainer = styled.View`
  flex: 1;
  background-color: white;
`;
const GameTitleContainer = styled.View`
  flex: 0.4;
  background-color: slateblue;
  align-items: center;
`;
const GameTitle = styled.Text`
  font-family: insungitCutelivelyjisu;
  font-size: 70px;
  padding-top: 200px;
`;
const IllustContainer = styled.View`
  flex: 0.2;
  background-color: slateblue;
  align-items: center;
  justify-content: center;
  padding-bottom: 20px;
`;
const GameBtnContainer = styled.View`
  flex: 0.3;
  background-color: slateblue;
  align-items: center;
  paddingtop: 50px;
`;
const PressView = styled(Animated.createAnimatedComponent(Pressable))``;
const GameBtnText = styled.Text`
  font-family: insungitCutelivelyjisu;
  font-size: 25px;
`;
const SoundBtn = styled(Animated.createAnimatedComponent(Pressable))`
  position: absolute;
  top: 35px;
  right: 10px;
`;
const AdsContainer = styled.View`
  flex: 0.1;
  background-color: slateblue;
  align-items: center;
  justify-content: flex-end;
`;
const styles = StyleSheet.create({
  boxShadow: {
    backgroundColor: "white",
    width: 120,
    height: 70,
    borderRadius: 20,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
});
