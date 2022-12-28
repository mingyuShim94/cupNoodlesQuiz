import React, { useEffect, useState } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import styled from 'styled-components/native';
import problemList from '../assets/problemList';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
const STORAGE_KEY_RECORD = '@my_record';
const WindowWidth = Dimensions.get('window').width;
import { Audio } from 'expo-av';
const StageSelect = ({ navigation: { navigate, addListener } }) => {
  const [record, setRecord] = useState(
    Array.from({ length: problemList.length }, () => false)
  );
  const [clickSound, setClickSound] = useState();

  useEffect(() => {
    const goBackListener = addListener('focus', () => {
      getRecordData();
      return goBackListener;
    });
  }, []);

  const clickSoundPlay = async () => {
    console.log('Loading Sound');
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/Audio/click.mp3')
    );
    setClickSound(sound);

    console.log('Playing Sound');
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
        keyExtractor={(item) => item.id + ''}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        columnWrapperStyle={{
          justifyContent: 'space-around',
        }}
        renderItem={({ item, index }) => (
          <StageView
            onPress={() => {
              clickSoundPlay();
              navigate('Quiz', { stageIndex: index });
            }}>
            {record[index] == false ? (
              <Image
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'contain',
                }}
                source={require('../assets/cupIilust.jpg')}
              />
            ) : (
              <Image
                style={{
                  height: '100%',
                  width: '100%',
                  resizeMode: 'contain',
                }}
                source={item.img}
              />
            )}

            <IndexText>{index + 1}</IndexText>
          </StageView>
        )}
      />
    </WindowContainer>
  );
};
// <Image
//                 style={{ height: '100%', width: '100%', resizeMode: 'contain' }}
//                 source={item.img}
//               />
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
  position:absolute;
`;
