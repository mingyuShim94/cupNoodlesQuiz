import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import styled from 'styled-components/native';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
  setTestDeviceIDAsync,
} from 'expo-ads-admob';
const WindowWidth = Dimensions.get('window').width;
const data = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];

const StageSelect = ({ navigation: { navigate } }) => {
  return (
    <WindowContainer>
      <FlatList
        data={data}
        numColumns={3}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        columnWrapperStyle={{
          justifyContent: 'space-between',
        }}
        renderItem={(item) => (
          <StageView
            onPress={() => navigate('Quiz', { stageIndex: item.index })}>
            <IndexText>{item.index + 1}</IndexText>
          </StageView>
        )}
      />
    </WindowContainer>
  );
};

export default StageSelect;

const WindowContainer = styled.View`
  flex:1;
  background-color:blue;
  paddingTop:30px;
  paddingHorizontal:15px;
`;

const StageView = styled.TouchableOpacity`
  width:${WindowWidth / 4};
  height:${WindowWidth / 4};
  background-color:red;
  border-radius:20px;
`;

const IndexText = styled.Text`
  font-size:15px;
  background-color:white;
  alignSelf:flex-start
  border-radius:5px;
`;
