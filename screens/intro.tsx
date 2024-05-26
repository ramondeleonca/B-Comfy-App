import { FC, createContext, useContext, useEffect, useState } from "react";
import View from "./../components/View";
import AppIntroSlider from "react-native-app-intro-slider";
import { Button, Chip, Text, TextInput } from "react-native-paper";
import { MotiImage, MotiScrollView, MotiView } from "moti";
import condiciones from "./../condiciones.json";
import Chips from "../components/Chips";
import { Platform } from "react-native";
import * as Linking from "expo-linking";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type IntroContextType = {
    canContinue: boolean,
    setCanContinue: (value: boolean) => void,
    currentSlide: number,
    previousSlide: number
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
    const { setCanContinue } = useIntroContext();

    useEffect(() => {
        setTimeout(() => {
            setCanContinue(true);
        }, 1000);
    }, []);

    return (
        <MotiView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} from={{ translateY: 100, scale: 0.85 }} animate={{ translateY: 0, scale: 1 }} transition={{ delay: 500, duration: 500, type: "timing" }}>
            <MotiImage source={require("./../assets/bcomfylogo.png")} style={{width: "90%", aspectRatio: 1, height: "auto", objectFit: "contain"}} from={{scale: 0.25, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{ type: "timing", duration: 750 }}></MotiImage>
            <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1000, delay: 500}}>
                <Text style={{ fontSize: 24, textAlign: "center", margin: 16 }}>Bienvenido a BComfy</Text>
            </MotiView>
        </MotiView>
    )
}

function Step2({ index }: StepProps) {
    const { setCanContinue, currentSlide, previousSlide } = useIntroContext();
    const [selected, setSelected] = useState<string[]>([]);

    // TODO: Verify inputs before continuing
    useEffect(() => {
        setCanContinue(true);
    }, []);

    // TODO: Handle form values
    // TODO: Store form values
    return (currentSlide == index || previousSlide == index) && (
        <View style={{ flex: 1, justifyContent: "flex-start", alignItems: "flex-start", width: "100%" }}>
            <MotiView from={{ translateY: 50, opacity: 0 }} animate={{ translateY: 0, opacity: 1 }} transition={{ type: "timing", duration: 500 }}>
                <Text variant="displayMedium" style={{ marginTop: 50, marginLeft: 25 }}>Vamos a conocernos</Text>
            </MotiView>

            <MotiScrollView style={{ padding: 25, width: "100%" }} contentContainerStyle={{ flex: 1, justifyContent: "flex-start", alignItems: "stretch", width: "100%" }} from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: "timing", duration: 750, delay: 250 }}>
                <TextInput label={"Nombre"} placeholder="¿Cómo te llamas?" mode="outlined" style={{ width: "100%" }}></TextInput>
                <TextInput label={"Correo Electrónico"} placeholder="¿Cuál es tu correo electrónico?" mode="outlined" style={{ width: "100%" }}></TextInput>
                <TextInput label={"Número de teléfono"} placeholder="¿Cuál es tu número de teléfono?" mode="outlined" style={{ width: "100%" }}></TextInput>
                <TextInput label={"Contraseña"} placeholder="Crea una contraseña" mode="outlined" style={{ width: "100%" }}></TextInput>

                <View style={{ width: "100%", paddingTop: 30, paddingBottom: 50, flex: 1, flexWrap: "wrap", justifyContent: "flex-start", alignItems: "flex-start" }}>
                    <Chips data={condiciones} onSelect={setSelected} selected={selected}></Chips>
                </View>
            </MotiScrollView>
        </View>
    )
}

function Step3({ index }: StepProps) {
    const { setCanContinue } = useIntroContext();

    useEffect(() => {
        setCanContinue(false);
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <MotiView style={{ flex: 1, justifyContent: "center", alignItems: "center" }} from={{ translateY: 100, scale: 0.85 }} animate={{ translateY: 0, scale: 1 }} transition={{ delay: 500, duration: 500, type: "timing" }}>
                <MotiImage source={require("./../assets/bcomfylogo.png")} style={{width: "90%", aspectRatio: 1, height: "auto", objectFit: "contain"}} from={{scale: 0.25, opacity: 0}} animate={{scale: 1, opacity: 1}} transition={{ type: "timing", duration: 750 }}></MotiImage>
                <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 1000, delay: 500}}>
                    <Text style={{ fontSize: 24, textAlign: "center", margin: 16 }}>Conecta tu BComfy</Text>
                </MotiView>
                <MotiView from={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 750, delay: 750}}>
                    <Button icon={"bluetooth"} mode="contained" onPress={() => Linking.openURL(Platform.OS == "android" ? "android.settings.BLUETOOTH_SETTINGS" : "App-Prefs:Bluetooth")}>Configuración Bluetooth</Button>
                </MotiView>
            </MotiView>
        </View>
    )
}

export default function Intro({ navigation }: { navigation: NativeStackNavigationProp<any> }) {
    const [canContinue, setCanContinue] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [previousSlide, setPreviousSlide] = useState(0);
    const screens = [
        Step1,
        Step2,
        Step3
    ].map(component => ({ Element: component as FC<StepProps> }));

    return (
        <IntroContext.Provider value={{ canContinue, setCanContinue, currentSlide, previousSlide }}>
            <AppIntroSlider
                renderItem={({ item, index }) => <item.Element index={index}></item.Element>}
                data={screens}
                dotStyle={{ display: "none" }}
                activeDotStyle={{ display: "none" }}
                showPrevButton={true}
                showSkipButton={false}
                showNextButton={canContinue}
                showDoneButton={canContinue}
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