import React, { useEffect, useState } from 'react';
import { View, ToastAndroid, ActivityIndicator, Dimensions, TouchableHighlight, Text, useWindowDimensions } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import "@babylonjs/loaders/glTF";
import "@babylonjs/materials";
import { Scene } from '@babylonjs/core/scene';
import { Asset } from 'expo-asset';
import my_model from "../assets/models/littlefriend10.glb";
import { WebXRSessionManager } from '@babylonjs/core/XR';
import { Vector3 } from '@babylonjs/core';
import { captureScreen } from 'react-native-view-shot';
import PortalPhoto from './PortalPhoto';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import Orientation from 'react-native-orientation-locker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EngineScreen = props => {
    const { h, w } = useWindowDimensions();

    const engine = useEngine();
    let [camera, setCamera] = useState();
    let [xrSession, setXrSession] = useState();
    let [trackingState, setTrackingState] = useState();
    let [scene, setScene] = useState({});
    let [kitty, setKitty] = useState();
    let [onSession, setOnSession] = useState(false);
    let [goAR, setGoAR] = useState(false);
    let [isLoading, setIsLoading] = useState(true);
    let [tempPhoto, settempPhoto] = useState();
    let [portalOn, setPortalOn] = useState(false);
    let [hideElements, setHideElements] = useState(false);

    // EXIT AR MODE FUNCTION
    async function exitAR() {
        Orientation?.lockToPortrait();
        if (kitty) {
            kitty.position = new Vector3(0, 0, 0);
            kitty.rotate(new Vector3(0, 1, 0), Math.PI);
        }
        await xrSession?.exitXRAsync();
        setTrackingState(undefined);
        setXrSession(undefined);
        console.log('Out of AR mode');
        setPortalOn(false);
    }

    // HANDLING AR MODE 
    const handleAR = async isAR => {
        try {
            console.log('isAR:', isAR);
            if (isAR) {
                console.log('Starting AR mode');
                if (xrSession) {
                    await xrSession?.exitXRAsync();
                } else {
                    if (scene !== undefined) {
                        // Creating default XR experience
                        const sessionManager = new WebXRSessionManager(scene);
                        const xr = await sessionManager?.scene?.createDefaultXRExperienceAsync({
                            disableDefaultUI: true,
                            disableTeleportation: true,
                        });
                        console.log('Default experience created ...');

                        // positioning my model 
                        kitty.position = new Vector3(0, -2, 15);
                        kitty.rotate(new Vector3(0, 1, 0), Math.PI);

                        // Unlocking screen Orientation | If a photo is taken will need to know the Orientation
                        Orientation?.unlockAllOrientations();

                        // Enter on AR mode
                        const xrSession_ = await xr?.baseExperience?.enterXRAsync(
                            'immersive-ar',
                            'unbounded',
                            xr?.renderTarget
                        )
                        //console.log('xrSession: ', xrSession_);
                        
                        // Listeners
                        setTrackingState(xr?.baseExperience?.camera?.trackingState);

                        xr?.baseExperience?.camera?.onTrackingStateChanged.add(
                            newTrackingState => {
                                setTrackingState(newTrackingState);
                            },
                        );

                        xrSession?.onXRSessionEnded.add(async () => { await exitAR() });
                        setXrSession(xrSession_);
                    }
                }
            } else {
                await exitAR();
            }
        } catch (error) {
            ToastAndroid.show('Ups! Something went wrong: ' + error, 3000);
            await exitAR();
        }
    };

    // CAMERA - TAKE A PHOTO IN AR MODE AND SAVE IT IN THE ANDROID GALLERY
    async function takeAPic() {
        console.log('Taking pic... ', Dimensions.get('screen'));
        hideElements = true;
        setHideElements(hideElements);
        setTimeout(() => { }, 600);
        try {
            const uri = await captureScreen({
                handleGLSurfaceViewOnAndroid: true, // this is just working on Android for now
                quality: 0.9,
                format: 'jpg',
                fileName: 'littleFriend-', // It will be transform to something like 'littleFriend-5606737351759347920.jpg'
            });
            console.log("Temp Image saved to", uri);
            Orientation?.lockToPortrait();

            // Access to gallery and save the picture in the LittleFriend album folder
            // if the folder is not there it creates it.
            let toGallery = await CameraRoll.save(uri, { album: 'LittleFriend' });
            // console.log('toGallery: ', toGallery);

            // We set the current picture info for the PortalPhoto component
            let imgPage = await CameraRoll?.getPhotos({ first: 1, group_name: 'LittleFriend', include: ['imageSize'] });
            tempPhoto = imgPage.edges[0]?.node?.image;
            settempPhoto(tempPhoto);

            setPortalOn(true);

        } catch (error) {
            console.log('error: ', error);
        }
    }

    // INITIATING AND SETTONG THE SCENE WITH OUR MODEL
    async function init() {
        try {
            // Load the Schrödingers kitty model
            const [{ localUri }] = await Asset.loadAsync(my_model);
            // console.log('localUri: ', localUri);

            console.log('Setting scene: ');
            scene = new Scene(engine);

            console.log("Adding camera...");
            scene?.createDefaultCameraOrLight(true, true, true);
            (scene?.activeCamera).alpha += Math.PI;
            (scene?.activeCamera).radius = 25;

            console.log('Importing mesh... ');

            // const fast_test_model = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoxAnimated/glTF/BoxAnimated.gltf';
            const meshLoad = await SceneLoader?.ImportMeshAsync("", localUri, "", scene);
            console.log('Meshload loaded ');

            setCamera(scene?.activeCamera);
            if (!meshLoad) {
                return;
            }
            kitty = meshLoad?.meshes[0] || null;
            setKitty(kitty);
            setScene(scene);
            onSession = true;
            setOnSession(onSession);
            console.log('Scene created!');
            isLoading = false;
            setIsLoading(isLoading);

            return scene;

        } catch (error) {
            console.log('error: ', error);
            ToastAndroid.show('Ups! Something went wrong: ' + error, 3000);
            return;
        }
    }

    useEffect(() => {
        if (engine && !onSession) {
            try {
                init();
            } catch (error) {
                ToastAndroid.show('Ups! Something went wrong: ' + error, 3000);
                console.log('error: ', error);
            }
        }
    }, [engine, xrSession]);

    return (
        <>
            <View style={{ flex: 1, height: h, width: w }} >
                {
                    isLoading && (
                        <View style={{ flex: 1, width: '100%', height: '100%', alignContent: 'center', justifyContent: 'center', position: 'absolute', backgroundColor: '#000000', zIndex: 2 }} >
                            <ActivityIndicator size={128} color='#00ff00' />
                        </View>
                    )
                }
                {
                    portalOn &&
                    <View style={{ flex: 1, width: '100%', height: '100%', position: 'absolute', backgroundColor: '#000000', zIndex: 100 }} >
                        <PortalPhoto photo={tempPhoto}
                            closePortal={() => {
                                setPortalOn(false);
                                Orientation?.unlockAllOrientations();
                                setHideElements(false);
                                settempPhoto(undefined);
                            }} />
                    </View>
                }
                <View collapsable={false} style={{ flex: 1 }}>
                    <EngineView camera={camera} />
                </View>
                <View
                    style={{
                        display: (hideElements | isLoading) ? 'none' : 'flex',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        bottom: 0,
                        position: 'absolute',
                        zIndex: 10,
                        backgroundColor: 'rgba(0,0,0,0)',
                    }}>
                    <TouchableHighlight
                        style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 10 }}
                        onPress={() => { goAR = !goAR; setGoAR(goAR); console.log('goAR: ', goAR); handleAR(goAR) }}
                    >
                        <View >
                            <Icon name={goAR ? "accessibility-new" : "view-in-ar"} size={50} color="#ffffff" style={{ alignSelf: 'center' }} />
                            <Text selectionColor="#000000" style={{ color: "#ffffff", alignSelf: 'center', fontFamily: 'Roboto-Light', fontSize: 11 }} >{goAR ? 'Model' : 'AR View'}</Text>
                        </View>
                    </TouchableHighlight>
                    {
                        goAR &&
                        <TouchableHighlight
                            style={{ paddingLeft: 5, paddingRight: 5, paddingBottom: 10 }}
                            onPress={async () => await takeAPic()}
                        >
                            <View >
                                <Icon name="camera" size={50} color="#ffffff" style={{ alignSelf: 'center' }} />
                                <Text selectionColor="#000000" style={{ color: "#ffffff", alignSelf: 'center', fontFamily: 'Roboto-Light', fontSize: 11 }} >Capture</Text>
                            </View>
                        </TouchableHighlight>
                    }
                </View>
            </View>
        </>
    );
};

export default EngineScreen;