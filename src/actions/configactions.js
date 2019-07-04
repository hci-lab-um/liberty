import * as scanningTypes from '../configuration/scanningtypes'
import { leapConnect, leapDisconnect } from './leapactions';
import {connectmyo} from './myoactions';
import { clearAutomaticScanning, automaticScanning } from './eventsactions';
const {ipcRenderer} = window.require('electron')

// Initialisation of the configuration values
let chosenScanningGesture;
let chosenBackScanningGesture;
let chosenSelectorGesture;
let scanningType = scanningTypes.ROW_BASED_SCANNING;
let isLeap = false;
let isMyo = true;
let leapInterval = 1000;
let highlightColor = 'green';
let itemsPerRow = 10;
let isLocked = false;
let automaticScanningInterval = 2500;
let transition = 'jiggle';
let automaticIsLocked = false;
let regionScanningColumns = 3;
let regionScanningRows = 2;
let defaultVocabularyPath = "demoboard.json";

export function changeConfig(configObject, save = false){
    chosenScanningGesture = configObject.scanningGesture;
    chosenBackScanningGesture = configObject.backScanningGesture;
    chosenSelectorGesture = configObject.selectorGesture;
    scanningType = configObject.scanningType;
    transition = configObject.transition;
    highlightColor = configObject.highlightColor;
    isLeap = configObject.isLeap;
    leapInterval = configObject.leapInterval;
    regionScanningRows = parseInt(configObject.regionScanningRows);
    regionScanningColumns = parseInt(configObject.regionScanningColumns);
    defaultVocabularyPath = configObject.vocabularyFile;
    setAutomaticScanningInterval(configObject.automaticScanningInterval);

    if(save){
       /*if the configuration is to be said then this means that the user has modified the configuration
         and the setters that dispatch events to the main board need to be called */
        setScanningType();
        setTransition();
        // send the new configuration to the main process
        ipcRenderer.send('configChange', configObject);
    }

    if(configObject.scanningGesture === "AUTOMATIC"){
        /* if the selection is automatic then first the interval of the automatic scanning function has to be cleared
           in case automatic was the previous scanning gesture*/
        automaticIsLocked = false;
        clearAutomaticScanning();
        automaticScanning();
    }else{
        // remove the automatic scanning function's interval
        clearAutomaticScanning();
    }

    // connect to LEAP Motion only if a gesture selected makes use of LEAP Motion
    if(configurationIsLeap()){
        // first disconnect so that the function that habdles LEAP events does not get executed twice
        leapDisconnect().then(()=>{
            leapConnect();
        });
    }else
        leapDisconnect();

    // connect to Myo if one of the gestures selected makes use of Myo   
    if(configurationIsMyo())
        connectmyo()
}

export function getChosenScanningGesture(){
    return chosenScanningGesture;
}

export function getChosenBackScanningGesture(){
    return chosenBackScanningGesture;
}

export function getChosenSelectorGesture(){
    return chosenSelectorGesture;
}

export function getScanningType(){
    return scanningType;
}

export function setScanningType(){
    // dispatch event to change the scanning type instantly
    document.dispatchEvent(new CustomEvent('scanningTypeChanged'));
}

// check whether LEAP is needed for one of the gesture mappings
export function configurationIsLeap(){
    return isLeap;
}

// check whether Myo is needed for one of the gesture mappings
export function configurationIsMyo(){
    return isMyo;
}

export function getLeapInterval(){
    return leapInterval;
}

export function setLeapInterval(newLeapInterval){
    leapInterval = newLeapInterval;
}

export function getHighlightColor(){
    return highlightColor;
}

export function setHighlightColor(newColor){
   highlightColor = newColor;
}

export function getTransition(){
    return transition;
}

export function setTransition(){
    // dispatch event to trigger transition change instantly
   document.dispatchEvent(new CustomEvent('transitionChanged'));
}


export function getAutomaticScanningInterval(){
    return automaticScanningInterval;
}

export function setAutomaticScanningInterval(newInterval){
   automaticScanningInterval = newInterval;
}

export function getItemsPerRow(){
    return itemsPerRow;
}

// function to set how many items are to be displayed per row
export function setItemsPerRow(itemsCount, callback){
    // the number of items per row depends on the total number of items in the current vocabulary
    if(itemsCount <= 18)
        itemsPerRow = 6;
    else if(itemsCount <= 21){
        itemsPerRow = 7;
    } else if(itemsCount <= 28){
        itemsPerRow = 8;
    }else{
        // when there are more than 28 items per row apply formula below to get number of items per row
        itemsPerRow = Math.ceil(itemsCount/4); 
    }
    callback();
}

export function getRegionScanningColumns(){
    return regionScanningColumns;
}

export function getRegionScanningRows(){
    return regionScanningRows;
}

// get default vocabulary path
export function getDefaultVocabularyPath(){
    return defaultVocabularyPath;
}

// lock automatic scanning when a LEAP gesture is being detected
export function getAutomaticIsLocked(){
    return automaticIsLocked;
}

export function setAutomaticIsLocked(inAutomaticIsLocked){
    automaticIsLocked = inAutomaticIsLocked;
}

// Used to lock selection of items
export function lockSelector(){
    isLocked = true;
}

export function unlockSelector(){
    isLocked = false;
}

export function selectorIsLocked(){
    return isLocked;
}