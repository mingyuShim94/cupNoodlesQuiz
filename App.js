import React, { useEffect, useState } from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import styled from 'styled-components/native';

const WindowContainer = styled.View`
  flex:1;
  background-color:blue;
`;
const QuizContainer = styled.View`
  flex:0.6;
  background-color:red;
`;
const AnswerContainer = styled.View`
  flex:0.1;
  background-color:yellow;
  justify-content:center;
  align-items:center;
  flex-direction:row;
`;
const AnswerSquare = styled.TouchableOpacity`
  width:50;
  height:50;
  background-color:red;
  borderRadius:15;
  marginHorizontal:7;
  justify-content:center;
  align-items:center;
`;
const WordContainer = styled.View`
  flex:0.2;
  background-color:skyblue;
`;
const WordsRow1 = styled.View`
  flex:0.5;
  background-color: pink;
  justify-content:center;
  align-items:center;
  flex-direction:row;
`;
const WordsRow2 = styled.View`
  flex:0.5;
  background-color: purple;
  justify-content:center;
  align-items:center;
  flex-direction:row;
`;
const WordSquare = styled.TouchableOpacity`
  width:50;
  height:50;
  background-color:blue;
  borderRadius:15;
  marginHorizontal:4;
  justify-content:center;
  align-items:center;
`;
const WordStyle = styled.Text`
  font-size:20;
`;
const AdsContainer = styled.View`
  flex:0.1;
  background-color:black;
`;

const words1 = ['김', '신', '라', '콩', '튀', '너', '윤'];
const words2 = ['면', '망', '통', '선', '깨', '음', '미'];

export default function App() {
  const [answerArr, setAnswerArr] = useState(
    Array.from({ length: 3 }, (v, i) => null)
  );
  const answerPush = (word) => {
    //console.info(answerArr);
    let findIndex = answerArr.findIndex((item) => item === null);
    if (findIndex == -1) return null;
    const temp = [...answerArr];
    temp[findIndex] = word;
    //console.info(temp);
    setAnswerArr(temp);
    console.info(temp);
  };
  return (
    <WindowContainer>
      <QuizContainer>
        <Image
          style={{ height: '100%', width: '100%', resizeMode: 'cover' }}
          source={require('./assets/shin.jpg')}
        />
      </QuizContainer>
      <AnswerContainer>
        {answerArr.map((data, idx) => (
          <AnswerSquare>
            <WordStyle>{data}</WordStyle>
          </AnswerSquare>
        ))}
      </AnswerContainer>
      <WordContainer>
        <WordsRow1>
          {words1.map((data, idx) => (
            <WordSquare onPress={() => answerPush(data)}>
              <WordStyle>{data}</WordStyle>
            </WordSquare>
          ))}
        </WordsRow1>
        <WordsRow2>
          {words2.map((data, idx) => (
            <WordSquare onPress={() => answerPush(data)}>
              <WordStyle>{data}</WordStyle>
            </WordSquare>
          ))}
        </WordsRow2>
      </WordContainer>
      <AdsContainer></AdsContainer>
    </WindowContainer>
  );
}
