import { ImageSourcePropType, StyleSheet, Platform, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState, useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import Button from '@/components/Button'; 
import ImageViewer from '@/components/ImageViewer'; 
import IconButton from '@/components/IconButton';
import CircleButton from '@/components/CircleButton';
import EmojiPicker from '@/components/EmojiPicker';
import EmojiList from '@/components/EmojiList';
import EmojiSticker from '@/components/EmojiSticker';
import * as MediaLibrary from 'expo-media-library';
import domtoimage from 'dom-to-image';


const PlaceholderImage = require('@/assets/images/background-image.png');

export default function Index() {
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined); 
  const [showAppOptions, setshowAppOptions] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [pickedEmoji,setpickedEmoji] = useState<ImageSourcePropType | undefined>(undefined);
  const imageRef = useRef<View>(null);

  if (status === null) {
    requestPermission();
  }
  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
      setshowAppOptions(true);
    } else {
      alert('You did not select any image.');
    }
  };
  const onReset = () => {
    setshowAppOptions(false);
  };

  
  const onAddStricker = () => {
    setIsModalVisible(true);
  };

  
  const onModalClose = () => {
    setIsModalVisible(false);
  };

  const onSaveImageAsync = async  () => {
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });
  
        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert('Saved!');
        }
      } catch (e) {
        console.log(e);
      }
    }else{
      try {
        const dataUrl = await domtoimage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
    
  };


  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer imgSource={PlaceholderImage} selectedImage={selectedImage} />
          {pickedEmoji && <EmojiSticker imageSize={40} stickerSource={pickedEmoji} />}
        </View>
      </View>
      {showAppOptions ? (
      <View style={styles.optionsContainer}>
        <View style = {styles.optionsRow}>
          <IconButton icon='refresh' label='Reset' onPress={onReset} />
          <CircleButton onPress={onAddStricker} />
          <IconButton icon='save-alt' label='Save' onPress={onSaveImageAsync} />
        </View>
      </View>
      ) : (
      <View style={styles.footerContainer}>
        <Button label='Choose a photo' theme='primary' onPress={pickImageAsync} />
        <Button label='Use this photo' onPress={ () => setshowAppOptions(true) } />
      </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setpickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },


});
