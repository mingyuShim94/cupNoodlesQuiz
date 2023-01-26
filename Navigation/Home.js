import React, { useEffect, useState, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
} from "react-native";
import styled from "styled-components/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { Shadow } from "react-native-shadow-2";
import { Octicons } from "@expo/vector-icons";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
const STORAGE_KEY_BANNER = "@my_banner";
const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-8647279125417942/6622534546";

const Home = ({ navigation: { navigate, addListener } }) => {
  const [bgmSound, setBgmSound] = useState();
  const [clickSound, setClickSound] = useState();
  const [cupOpen, setCupOpen] = useState(false);
  const [mute, setMute] = useState(false);
  const scaleStartBtn = useRef(new Animated.Value(1)).current;
  const [bannerShow, setBannerShow] = useState(true);
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

  useEffect(() => {
    const goBackListener = addListener("focus", () => {
      getBannerData();
      return goBackListener;
    });
  }, []);

  return (
    <WindowContainer>
      <StatusBar style="light" backgroundColor="black" />
      <SoundBtn
        onPress={() => {
          setMute((prev) => !prev);
          bgmSoundPlay(mute);
        }}
      >
        {mute
          ? () => {
              return (
                <Octicons name="mute" size={WindowWidth / 10} color="black" />
              );
            }
          : () => {
              return (
                <Octicons
                  name="unmute"
                  size={WindowWidth / 8.2285}
                  color="black"
                />
              );
            }}
      </SoundBtn>
      <GameTitleContainer>
        <GameTitle>{"컵라면 초성퀴즈"}</GameTitle>
      </GameTitleContainer>
      <IllustContainer>
        {cupOpen == false ? (
          <Image
            style={{
              height: "100%",
              width: "100%",
              resizeMode: "contain",
              alignSelf: "center",
              left: WindowWidth / 16.4571,
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
              left: WindowWidth / 16.4571,
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
  font-size: ${WindowWidth / 8}px;
  padding-top: ${WindowHeight / 4.082}px;
`;
const IllustContainer = styled.View`
  flex: 0.2;
  background-color: slateblue;
  align-items: center;
  justify-content: center;
  padding-bottom: ${WindowHeight / 40.828}px;
`;
const GameBtnContainer = styled.View`
  flex: 0.3;
  background-color: slateblue;
  align-items: center;
  paddingtop: ${WindowHeight / 16.341}px;
`;
const PressView = styled(Animated.createAnimatedComponent(Pressable))``;
const GameBtnText = styled.Text`
  font-family: insungitCutelivelyjisu;
  font-size: ${WindowWidth / 16.457}px;
`;
const SoundBtn = styled.Pressable`
  position: absolute;
  width: 80px;
  height: 80px;
  align-items: center;
  justify-content: center;
  //background-color: red;
  z-index: 1;
  top: ${WindowHeight / 30}px;
  right: ${WindowWidth / 70}px;
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
    width: WindowWidth / 3.428,
    height: WindowHeight / 11.665,
    borderRadius: WindowWidth / 20.571,
    borderWidth: WindowWidth / 137.142,
    alignItems: "center",
    justifyContent: "center",
  },
});
