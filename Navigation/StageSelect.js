import React, { useEffect, useState, useRef } from "react";
import {
  View,
  FlatList,
  Dimensions,
  Image,
  Animated,
  Pressable,
} from "react-native";
import styled from "styled-components/native";
import problemList from "../assets/problemList";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
const STORAGE_KEY_RECORD = "@my_record";
const WindowWidth = Dimensions.get("window").width;
import { Audio } from "expo-av";
const StageSelect = ({ navigation: { navigate, addListener } }) => {
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const [clickSound, setClickSound] = useState();
  const scaleArr = useRef(
    Array.from({ length: problemList.length }, (v, i) => new Animated.Value(1))
  ).current;

  useEffect(() => {
    const goBackListener = addListener("focus", () => {
      getRecordData();
      return goBackListener;
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

  return (
    <WindowContainer>
      <StatusBar style="light" backgroundColor="black" />
      <FlatList
        data={problemList}
        numColumns={3}
        keyExtractor={(item, index) => index}
        ItemSeparatorComponent={() => <View style={{ height: 30 }} />}
        columnWrapperStyle={{
          justifyContent: "space-around",
        }}
        contentContainerStyle={{ paddingBottom: 20 }}
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
  );
};
export default StageSelect;

const WindowContainer = styled.View`
  flex: 1;
  background-color: slateblue;
  padding-top: 40px;
  padding-horizontal: 12px;
`;

const StageView = styled(Animated.createAnimatedComponent(Pressable))`
  width: ${WindowWidth / 3.6}px;
  height: ${WindowWidth / 3.6}px;
`;

const IndexText = styled.Text`
  font-size:15px;
  background-color:black;
  alignSelf:flex-start
  paddingHorizontal:3px;
  paddingTop:2px;
  position:absolute;
  fontFamily:insungitCutelivelyjisu;
  color:white;
  borderTopLeftRadius:10px;
`;
