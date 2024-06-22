import { FC, createContext, useContext, useEffect, useState } from "react";
import View from "./../components/View";
import AppIntroSlider from "react-native-app-intro-slider";
import { Button, Snackbar, Text, TextInput } from "react-native-paper";
import { MotiImage, MotiView } from "moti";
import condiciones from "./../condiciones.json";
import Chips from "../components/Chips";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import SyncStorage from 'sync-storage';
import { NameSchema, PhoneSchema } from "../schema";
import RNPermissions from "react-native-permissions";
import RNBTClassic, { BluetoothDevice, BluetoothDeviceEvent, BluetoothEvent, BluetoothEventSubscription, BluetoothEventType } from "react-native-bluetooth-classic";
import { NAME_REGEX, PLATFORM_PERMISSIONS } from "../bluetooth-config";
import { useAppContext } from "../components/AppContext";
import { useForm } from "react-hook-form";
import { FormBuilder } from "react-native-paper-form-builder";

type IntroContextType = {
    canContinue: boolean,
    setCanContinue: (value: boolean) => void,
    currentSlide: number,
    previousSlide: number,
    formFields: {[key: string]: any},
    setFormFields: (value: {[key: string]: any}) => void
}
const IntroContext = createContext<IntroContextType | null>(null);
const useIntroContext = () => {
    const context = useContext(IntroContext);
    if (!context) throw new Error("useIntroContext must be used within a IntroContextProvider");
    return context;
}

type StepProps = {
    index: number
}

function Step1({ index }: StepProps) {
    const { setCanContinue, currentSlide } = useIntroContext();

    useEffect(() => {
        setTimeout(() => {
            setCanContinue(true);
        }, 1000);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <MotiView from={{ translateY: 100, scale: 0.85 }} animate={{ translateY: 0, scale: 1 }} transition={{ delay: 500, duration: 500, type: "timing" }}>
                <MotiImage source={require("./../assets/bcomfylogo.png")} style={{width: "90%", aspectRatio: 1, height: "auto", objectFit: "contain"}} from={{scale: 0.25, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{ type: "timing", duration: 750 }}></MotiImage>
                <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1000, delay: 500}}>
                    <Text style={{ fontSize: 24, textAlign: "center", margin: 16 }}>Bienvenido a BComfy</Text>
                </MotiView>
            </MotiView>
        </View>
    )
}

function Step2({ index }: StepProps) {
    const { setCanContinue, currentSlide, previousSlide, setFormFields } = useIntroContext();
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    const [nombre, setNombre] = useState<string>("");
    const [telefono, setTelefono] = useState<string>("");

    const [errorNombre, setErrorNombre] = useState<string>("");
    const [errorTelefono, setErrorTelefono] = useState<string>("");

    useEffect(() => {
        if (NameSchema.safeParse(nombre).success) {
            SyncStorage.set("nombre", nombre);
            setErrorNombre("");
        } else {
            setErrorNombre("El nombre no es válido");
        }
    }, [nombre]);

    useEffect(() => {
        if (PhoneSchema.safeParse(telefono).success) {
            SyncStorage.set("telefono", telefono);
            setErrorTelefono("");
        } else {
            setErrorTelefono("El número de teléfono no es válido");
        }
    }, [telefono]);

    // TODO: Handle form values better
    useEffect(() => {
        if (currentSlide == index) {
            if (NameSchema.safeParse(nombre).success && PhoneSchema.safeParse(telefono).success) {
                console.log("Se puede continuar")
                setCanContinue(true);
            } else {
                console.log("No se puede continuar")
                setCanContinue(false);
            }
        }
    }, [nombre, telefono, currentSlide]);

    // * Update form fields
    useEffect(() => {
        setFormFields({ nombre, telefono, condiciones: selectedConditions });
    }, [nombre, telefono, selectedConditions]);

    // TODO: Handle form values better
    return (currentSlide == index || previousSlide == index) && (
        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start", width: "100%", height: "100%" }}>
            <MotiView from={{ translateY: 50, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} transition={{ type: "timing", duration: 500 }}>
                <Text variant="displayMedium" style={{ marginTop: 50, marginLeft: 25 }}>Vamos a conocernos</Text>
            </MotiView>

            <MotiView style={{ padding: 25, width: "100%", flex: 1, justifyContent: "flex-start", alignItems: "stretch", height: "100%" }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 750, delay: 250 }}>
                <TextInput value={nombre} onChangeText={setNombre} label={"Nombre"} placeholder="¿Cómo te llamas?" mode="outlined" style={{ width: "100%" }}></TextInput>
                <Text style={{ color: "red" }}>{errorNombre}</Text>

                <TextInput value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" label={"Número de teléfono"} placeholder="¿Cuál es tu número de teléfono?" mode="outlined" style={{ width: "100%" }}></TextInput>
                <Text style={{ color: "red" }}>{errorTelefono}</Text>

                <View style={{ width: "100%", paddingBottom: 50, flex: 1, flexWrap: "wrap", height: "100%", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    <Chips data={condiciones} onSelect={setSelectedConditions} selected={selectedConditions}></Chips>
                </View>
            </MotiView>
        </View>
    )
}

function Step3({ index }: StepProps) {
    const { setCanContinue, currentSlide, formFields } = useIntroContext();
    const [snackBarShown, setSnackBarShown] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("No se pudo conectar, intenta de nuevo");
    const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
    const [bluetoothConnectingMessage, setBluetoothConnectingMessage] = useState<string>();
    const [lastBluetoothConnectingMessage, setLastBluetoothConnectingMessage] = useState<string>();
    const appCtx = useAppContext();

    useEffect(() => {
        if (currentSlide == index) setCanContinue(false);
    }, [currentSlide]);

    const changeBluetoothConnectingMessage = (message: string) => {
        setLastBluetoothConnectingMessage(bluetoothConnectingMessage);
        setBluetoothConnectingMessage(message);
    }

    const bluetoothBComfy = async () => {
        // Set connecting status
        setBluetoothConnecting(true);

        // Check for permissions
        changeBluetoothConnectingMessage("Solicitando permisos...");
        const permissionsResult = await RNPermissions.requestMultiple(PLATFORM_PERMISSIONS);
        const permissionsAllGranted  = Object.values(permissionsResult).every(permission => permission == "granted");
        console.log(permissionsResult, permissionsAllGranted);

        // Error if permissions not granted
        if (!permissionsAllGranted) {
            setSnackBarMessage("Es necesario que aceptes los permisos para continuar");
            setSnackBarShown(true);
            setBluetoothConnecting(false);
            return;
        }

        // Start scanning
        changeBluetoothConnectingMessage("Buscando BComfy...");
        // let subscription: BluetoothEventSubscription
        // const onDeviceDiscovery = (ev: BluetoothEvent) => {
        //     console.log(JSON.stringify(ev));
        //     if (ev && NAME_REGEX.test(ev.name)) {
        //         console.log("Found BComfy", ev.address);
        //         setFoundBcomfyAddress(ev.address);
        //         setBluetoothConnecting(false);
        //         setCanContinue(true);
        //         subscription.remove();
        //     }
        // }
        // subscription = RNBTClassic.onDeviceDiscovered(onDeviceDiscovery);
        // await RNBTClassic.startDiscovery();
        
        const devices = await RNBTClassic.getBondedDevices();
        console.log(devices);
        for (const device of devices) {
            if (NAME_REGEX.test(device.name)) {
                console.log("Found BComfy", device.address);
                appCtx.setDeviceAddress(device.address);
                setBluetoothConnecting(false);
                setCanContinue(true);
                return;
            }
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Snackbar visible={snackBarShown} onDismiss={() => setSnackBarShown(false)} style={{ marginBottom: 150 }}>{snackBarMessage}</Snackbar>
            <MotiView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} from={{ translateY: 100, scale: 0.85 }} animate={{ translateY: 0, scale: 1 }} transition={{ delay: 500, duration: 500, type: "timing" }}>
                <MotiImage source={require("./../assets/bcomfylogo.png")} style={{width: "90%", aspectRatio: 1, height: "auto", objectFit: "contain"}} from={{scale: 0.25, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{ type: "timing", duration: 750 }}></MotiImage>
                <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1000, delay: 500}}>
                    <Text style={{ fontSize: 24, textAlign: "center", marginTop: 16 }}>Conecta tu BComfy</Text>
                </MotiView>
                {
                    appCtx.deviceAddress ? (
                        <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 500}}>
                            <Text style={{ textAlign: "center"}}>Se encontró un dispositivo BComfy</Text>
                            <Text style={{ textAlign: "center"}}>BComfy.{appCtx.deviceAddress.slice(0, 2)} ({appCtx.deviceAddress})</Text>
                            <Text variant="headlineMedium" style={{ textAlign: "center"}}>Continúa en la siguiente página</Text>
                        </MotiView>
                    ) : bluetoothConnecting ? (
                        <View style={{ opacity: 0.75 }}>
                            <MotiView key={lastBluetoothConnectingMessage} from={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ type: "timing", duration: 500 }}>
                                <Text variant="labelLarge">{lastBluetoothConnectingMessage}</Text>
                            </MotiView>
                            <MotiView key={bluetoothConnectingMessage} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 500, delay: 500 }}>
                                <Text variant="labelLarge">{bluetoothConnectingMessage}</Text>
                            </MotiView>
                        </View>
                    ) : (
                        <>
                            <MotiView from={{opacity: 0}} animate={{opacity: 0.5}} transition={{duration: 500, delay: 100}}>
                                <Text style={{ fontSize: 18, textAlign: "center", marginBottom: 4 }}>Primero sincroniza en tu configuracion y despues presiona el botón</Text>
                            </MotiView>
                            <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 750, delay: 750}}>
                                <Button icon={"bluetooth"} mode="contained" onPress={bluetoothBComfy}>Haz click para conectar</Button>
                            </MotiView>
                        </>
                    )
                }
            </MotiView>
        </View>
    )
}

function Step4({ index }: StepProps) {
    const { setCanContinue, currentSlide, formFields } = useIntroContext();

    useEffect(() => {
        if (currentSlide == index) setCanContinue(true);
    }, [index]);

    return (
        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start", width: "100%", height: "100%" }}>
            <MotiView from={{ translateY: 50, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} transition={{ type: "timing", duration: 500 }}>
                <Text variant="displaySmall" style={{ marginTop: 50, marginLeft: 25 }}>Verifica tus datos</Text>
            </MotiView>
            {
                Object.entries(formFields).map(([key, value]) => (
                    <MotiView key={key} style={{ marginLeft: 25, marginTop: 25, width: "100%" }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 750, delay: 10 * index }}>
                        <Text variant="headlineSmall">{key.at(0)?.toUpperCase() + key.slice(1)}</Text>
                        <Text variant="bodyLarge">{Array.isArray(value) ? value.join(", ") : value}</Text>
                    </MotiView>
                ))
            }
        </View>
    )
}

function Step5({ index }: StepProps) {
    const appCtx = useAppContext();
    const { setCanContinue, currentSlide, formFields } = useIntroContext();
    const [snackBarShown, setSnackBarShown] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState("No se pudo conectar, intenta de nuevo");
    const [bluetoothConnecting, setBluetoothConnecting] = useState(false);
    const [bluetoothConnectingMessage, setBluetoothConnectingMessage] = useState<string>();
    const [lastBluetoothConnectingMessage, setLastBluetoothConnectingMessage] = useState<string>();

    
    const changeBluetoothConnectingMessage = (message: string) => {
        setLastBluetoothConnectingMessage(bluetoothConnectingMessage);
        setBluetoothConnectingMessage(message);
    }

    useEffect(() => {
        if (currentSlide == index) setCanContinue(false);
    }, [index]);

    const configurarBComfyInicio = async () => {
        setBluetoothConnecting(true);

        changeBluetoothConnectingMessage("Solicitando permisos...");
        const permissionsResult = await RNPermissions.requestMultiple(PLATFORM_PERMISSIONS);
        const permissionsAllGranted  = Object.values(permissionsResult).every(permission => permission == "granted");
        console.log(permissionsResult, permissionsAllGranted);

        if (!permissionsAllGranted) {
            setBluetoothConnecting(false);
            return;
        }

        changeBluetoothConnectingMessage("Buscando BComfy...");
        const devices = await RNBTClassic.getBondedDevices();
        console.log(devices);

        for (const foundDevice of devices) {
            if (NAME_REGEX.test(foundDevice.name)) {
                const device = await RNBTClassic.connectToDevice(foundDevice.address);
                const connected = await device.isConnected();
                if (connected) {
                    changeBluetoothConnectingMessage("Configurando BComfy...");
                    await device.write(`initial_config \"${JSON.stringify(formFields)}\"`, "ascii");
                    // TODO: THIS TOTALLY WORKS, JUST MAKE IT BETTER AND LET THE USER FINIS, GOOD JOB! :D
                    // while (!(await device.available())) {}
                    // if ((await device.read()).toLowerCase().includes("ok")) {
                    //     changeBluetoothConnectingMessage("Configuración exitosa");
                    //     setCanContinue(true);
                    // } else {
                    //     changeBluetoothConnectingMessage("No se pudo configurar BComfy");
                    // }
                } else {
                    changeBluetoothConnectingMessage("No se pudo conectar a BComfy");
                }
                return;
            }
        }

        changeBluetoothConnectingMessage("No se encontró BComfy");
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Snackbar visible={snackBarShown} onDismiss={() => setSnackBarShown(false)} style={{ marginBottom: 150 }}>{snackBarMessage}</Snackbar>
            <MotiView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} from={{ translateY: 100, scale: 0.85 }} animate={{ translateY: 0, scale: 1 }} transition={{ delay: 500, duration: 500, type: "timing" }}>
                <MotiImage source={require("./../assets/bcomfylogo.png")} style={{width: "90%", aspectRatio: 1, height: "auto", objectFit: "contain"}} from={{scale: 0.25, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{ type: "timing", duration: 750 }}></MotiImage>
                {
                    bluetoothConnecting ? (
                        <View style={{ opacity: 0.75 }}>
                            <MotiView key={lastBluetoothConnectingMessage} from={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ type: "timing", duration: 500 }}>
                                <Text variant="labelLarge">{lastBluetoothConnectingMessage}</Text>
                            </MotiView>
                            <MotiView key={bluetoothConnectingMessage} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 500, delay: 500 }}>
                                <Text variant="labelLarge">{bluetoothConnectingMessage}</Text>
                            </MotiView>
                        </View>
                    ) : (
                        <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1000, delay: 500}}>
                            <Button style={{ marginTop: 16 }} mode="contained" onPress={configurarBComfyInicio}>Configura tu BComfy</Button>
                        </MotiView>
                    )
                }
            </MotiView>
        </View>
    )
}

export default function Intro({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
    const [canContinue, setCanContinue] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [previousSlide, setPreviousSlide] = useState(0);
    const [formFields, setFormFields] = useState({} as {[key: string]: any});
    const screens = [
        // Step1,
        // Step2,
        // Step3,
        // Step4,
        Step5
    ].map(component => ({ Element: component as FC<StepProps> }));

    return (
        <IntroContext.Provider value={{ canContinue, setCanContinue, currentSlide, previousSlide, formFields, setFormFields }}>
            <AppIntroSlider
                renderItem={({ item, index }) => <item.Element index={index}></item.Element>}
                data={screens}
                dotStyle={{ display: "none" }}
                activeDotStyle={{ display: "none" }}
                pinchGestureEnabled={false}
                showPrevButton={true}
                showSkipButton={false}
                showNextButton={canContinue}
                showDoneButton={canContinue}
                scrollEnabled={canContinue}
                onDone={() => navigation.getParent("main" as any)!.navigate("main")}
                onSlideChange={(index, lastIndex) => {setCurrentSlide(index); setPreviousSlide(lastIndex)}}
                renderPrevButton={() => <Button mode="outlined">Atrás</Button>}
                renderNextButton={() => <Button mode="contained-tonal">Siguiente</Button>}
                renderDoneButton={() => <Button mode="contained">¡Listo!</Button>}
                overScrollMode="always"
            ></AppIntroSlider>
        </IntroContext.Provider>
    )
}