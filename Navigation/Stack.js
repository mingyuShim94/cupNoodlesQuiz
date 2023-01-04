import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Quiz from "./Quiz";
import Home from "./Home";
import StageSelect from "./StageSelect";
const NativeStack = createNativeStackNavigator();

const Stack = () => {
  return (
    <NativeStack.Navigator screenOptions={{ headerShown: false }}>
      <NativeStack.Screen name="Home" component={Home} />
      <NativeStack.Screen name="StageSelect" component={StageSelect} />
      <NativeStack.Screen name="Quiz" component={Quiz} />
    </NativeStack.Navigator>
  );
};

export default Stack;
