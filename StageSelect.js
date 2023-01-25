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
import Modal from "react-native-modal";
const STORAGE_KEY_RECORD = "@my_record";
const STORAGE_KEY_COIN = "@my_coins";
const STORAGE_KEY_BANNER = "@my_banner";
const WindowWidth = Dimensions.get("window").width;
const WindowHeight = Dimensions.get("window").height;
import { Audio } from "expo-av";
const StageSelect = ({ navigation: { navigate, addListener } }) => {
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const [coin, setCoin] = useState(100);
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WindowContainer>
        <StatusBar style="light" backgroundColor="black" />
        <Header>
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
      </WindowContainer>
    </SafeAreaView>
  );
};
export default StageSelect;

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
