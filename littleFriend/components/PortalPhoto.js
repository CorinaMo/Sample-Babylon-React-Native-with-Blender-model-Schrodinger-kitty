import React, { useEffect } from 'react';
import { View, Image, Dimensions, TouchableHighlight, ToastAndroid  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Sharing from 'expo-sharing';

const PortalPhoto = ({ photo, closePortal }) => {
    const w = Dimensions.get('window').width;
    const h = Dimensions.get('window').height;

    // CAMERA - SHARE PHOTO
    async function sharePhoto() {
        try {
          await Sharing.shareAsync(photo?.uri, {dialogTitle:'Let\'s share our little Schrödinger kitty!'});
        } catch (error) {
            ToastAndroid.show('Ups! Something wrong happened!');
            console.log(error);
            return;
        }
    }

    useEffect(() => {
        //console.log('photo: ', photo);
    }, [photo]);

    return (
        <>
            <View style={{ flex: 1, width: w, height: h, zIndex: 101, justifyContent: 'center', backgroundColor: '#fafafa' }}>
                <View
                    style={{
                        width: (photo?.width > photo?.height) ? w * 0.95 : w * 0.6, alignSelf: 'center',
                    }}>
                    <View
                        style={{
                            display: 'flex', flexDirection: 'row', alignSelf: 'flex-end' 
                        }}>
                        <TouchableHighlight
                            style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 10 }}
                            onPress={() => { sharePhoto() }}
                        >
                            <View >
                                <Icon name="share" size={32} color="#000000" />
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                            style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 10 }}
                            onPress={() => { return closePortal() }}
                        >
                            <View >
                                <Icon name="close" size={32} color="#000000" />
                            </View>
                        </TouchableHighlight>
                    </View>
                </View>
                <View
                    style={{
                        display: 'flex',
                        width: (photo?.width > photo?.height) ? w * 0.95 : w * 0.6, height: (((photo?.width > photo?.height) ? w * 0.95 : w * 0.6) * photo?.height) / photo?.width, alignSelf: 'center',
                        borderWidth: 14, borderColor: '#ffffff', borderRadius: 20, elevation: 3
                    }}>

                    {/* Last captured photo */}
                    <Image key="lastPicture" alt='Last captured picture'
                        source={{
                            isStatic: true,
                            height: '100%',
                            width: '100%',
                            uri: photo?.uri
                        }} />
                </View>
            </View>
        </>
    );
};

export default PortalPhoto;
