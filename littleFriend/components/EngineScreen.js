import React, { useEffect, useState } from 'react';
import { View, Button, ToastAndroid, ActivityIndicator } from 'react-native';
import { EngineView, useEngine } from '@babylonjs/react-native';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/core';
import "@babylonjs/loaders/glTF";
import "@babylonjs/materials";
import { Scene } from '@babylonjs/core/scene';
import { Asset } from 'expo-asset';
import my_model from "../assets/models/littlefriend10.glb";
import { WebXRSessionManager } from '@babylonjs/core/XR';
import { Vector3 } from '@babylonjs/core';

const EngineScreen = (props) => {
    const engine = useEngine();
    let [camera, setCamera] = useState();
    let [xrSession, setXrSession] = useState();
    let [trackingState, setTrackingState] = useState();
    let [scene, setScene] = useState({});
    let [kitty, setKitty] = useState();
    let [onSession, setOnSession] = useState(false);
    let [goAR, setGoAR] = useState(false);
    let [isLoading, setIsLoading] = useState(true);


    async function exitAR() {
        if (kitty) {
            kitty.position = new Vector3(0, 0, 0);
            kitty.rotate(new Vector3(0, 1, 0), Math.PI);
        }
        if (xrSession) {
            await xrSession?.exitXRAsync();
            setTrackingState(undefined);
            setXrSession(undefined);
            console.log('Out of AR mode');
        }
    }

    const handleAR = async isAR => {
        try {
            console.log('isAR:', isAR);
            if (isAR) {
                console.log('Starting AR mode');
                if (xrSession) {
                    await xrSession?.exitXRAsync();
                } else {
                    if (scene !== undefined) {
                        const sessionManager = new WebXRSessionManager(scene);
                        const xr = await sessionManager?.scene?.createDefaultXRExperienceAsync({
                            disableDefaultUI: true,
                            disableTeleportation: true,
                        });
                        console.log('Default experience created ...');

                        kitty.position = new Vector3(0, -2, 15);
                        kitty.rotate(new Vector3(0, 1, 0), Math.PI);

                        const xrSession_ = await xr?.baseExperience?.enterXRAsync(
                            'immersive-ar',
                            'unbounded',
                            xr?.renderTarget
                        )
                        //console.log('xrSession: ', xrSession_);
                        console.log('xrSession created......');

                        setTrackingState(xr?.baseExperience?.camera?.trackingState);
                        xr?.baseExperience?.camera?.onTrackingStateChanged.add(
                            newTrackingState => {
                                setTrackingState(newTrackingState);
                            },
                        );
                        xrSession?.onXRSessionEnded.add(() => {
                            kitty.position = new Vector3(0, 0, 0);
                            kitty.rotate(new Vector3(0, 1, 0), Math.PI);
                            setXrSession(undefined);
                            setTrackingState(undefined);
                            setXrSession(undefined);
                        });
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
        console.log('useEffect: ');
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
            <View style={{ flex: 1, backgroundColor: '#000000' }} >
                {
                    isLoading && (
                        <View style={{ flex: 1, width: '100%', height: '100%', alignContent: 'center', justifyContent: 'center', position: 'absolute', backgroundColor: '#000000', zIndex: 2 }} >
                            <ActivityIndicator size={150} color='#00ff00' />
                        </View>
                    )
                }
                <View style={{ flex: 1 }}>
                    <EngineView camera={camera} displayFrameRate={true} />
                </View>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignSelf: 'center',
                    }}>
                    <Button
                        color="#000000"
                        title={goAR ? 'Viewer' : 'AR mode'}
                        onPress={() => { goAR = !goAR; setGoAR(goAR); console.log('goAR: ', goAR); handleAR(goAR) }}
                    />
                </View>
            </View>
        </>
    );
};
export default EngineScreen;