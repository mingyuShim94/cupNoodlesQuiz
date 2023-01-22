import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import Stack from "./Navigation/Stack";
import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
// import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { Asset } from "expo-asset";
import problemList from "./assets/problemList";
import mobileAds from "react-native-google-mobile-ads";
import SplashScreen from "react-native-splash-screen";
const appFont = require("./assets/font1.ttf");

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  useEffect(() => {
    async function prepare() {
      try {
        mobileAds()
          .initialize()
          .then((adapterStatuses) => {
            // Initialization complete!
          });
        await Font.loadAsync(
          "insungitCutelivelyjisu",
          require("./assets/font1.ttf")
        );

        const imageAssets = problemList.map((data) => {
          return Asset.fromModule(data.img).downloadAsync();
        });
        await Promise.all([...imageAssets]);
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        SplashScreen.hide();
      }
    }

    prepare();
  }, []);
  if (!appIsReady) {
    return null;
  }
  return (
    <NavigationContainer>
      <Stack />
    </NavigationContainer>
  );
}
