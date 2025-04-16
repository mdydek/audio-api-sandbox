import { View, Text, Pressable } from 'react-native';
import { AudioContext, AudioBuffer } from 'react-native-audio-api';
import React, { FC, useEffect, useRef } from 'react';

type KeyName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
const Keys = ['A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;

type PR<T> = Partial<Record<KeyName, T>>;

interface ButtonProps {
  keyName: KeyName;
  onPressIn: (key: KeyName) => void;
  onPressOut: (key: KeyName) => void;
}

const sourceList: PR<string> = {
  A: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/A4.mp3',
  B: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/B4.mp3',
  C: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/C4.mp3',
  D: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/D4.mp3',
  E: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/E4.mp3',
  F: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/F4.mp3',
  G: 'https://github.com/fuhton/piano-mp3/raw/refs/heads/master/piano-mp3/G4.mp3',
};

const Button = ({ onPressIn, onPressOut, keyName }: ButtonProps) => (
  <Pressable
    onPressIn={() => onPressIn(keyName)}
    onPressOut={() => onPressOut(keyName)}
    style={({ pressed }) => ({
      margin: 4,
      padding: 12,
      borderRadius: 2,
      backgroundColor: pressed ? '#d2e6ff' : '#abcdef',
    })}
  >
    <Text style={{ color: 'white' }}>{`${keyName}`}</Text>
  </Pressable>
);

const SimplePiano: FC = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferMapRef = useRef<PR<AudioBuffer>>({});

  const onKeyPressIn = (which: KeyName) => {
    const audioContext = audioContextRef.current;
    let buffer = bufferMapRef.current[which];

    if (!audioContext || !buffer) {
      return;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;

    source.connect(audioContext.destination);
    source.start();
  };

  const onKeyPressOut = (which: KeyName) => {};

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    Object.entries(sourceList).forEach(async ([key, url]) => {
      bufferMapRef.current[key as KeyName] = await fetch(url)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) =>
          audioContextRef.current!.decodeAudioData(arrayBuffer)
        );
    });

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
      }}
    >
      {Keys.map((key) => (
        <Button
          onPressIn={onKeyPressIn}
          onPressOut={onKeyPressOut}
          keyName={key}
          key={key}
        />
      ))}
    </View>
  );
};

export default SimplePiano;