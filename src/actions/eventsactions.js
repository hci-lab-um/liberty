import {getChosenSelectorGesture, getChosenScanningGesture, getChosenBackScanningGesture, selectorIsLocked, getAutomaticScanningInterval, getAutomaticIsLocked} from './configactions'
import * as gestures from '../configuration/gestures'

export function handleMouseDown(clickTypeId){
    // when a mouse click is detected
    var clickType;
    if(clickTypeId === 1) clickType = gestures.LEFT_CLICK;
    else if(clickTypeId === 2) clickType = gestures.CENTER_CLICK;
    else if(clickTypeId === 3) clickType = gestures.RIGHT_CLICK;
    else clickType = null;

    if(clickType != null)
    {
        handleDispatchScanning(clickType);
        handleDispatchBackScanning(clickType);
        hanleDispatchSelector(clickType);
    }

}

export function handleKeyDown(keyCode){
    // when a keyboard press is detected
    var type;
    if(keyCode === 13) type = gestures.ENTER;
    else if(keyCode === 32) type = gestures.SPACEBAR;
    else if(keyCode === 39) type = gestures.RIGHT_ARROW;
    else if(keyCode === 37) type = gestures.LEFT_ARROW;
    else type = null;

    if(type != null)
    {
        handleDispatchScanning(type);
        handleDispatchBackScanning(type);
        hanleDispatchSelector(type);
    }
}

function hanleDispatchSelector(gesture){
    // dispatch selection event if conditions are met
    if(gesture === getChosenSelectorGesture() && !selectorIsLocked())
        document.dispatchEvent(new CustomEvent('selection', {detail: gesture}));
}

function handleDispatchScanning(gesture){
    // dispatch scanning event if conditions are met
    if(gesture === getChosenScanningGesture() && !selectorIsLocked())
        document.dispatchEvent(new CustomEvent('scanning', {detail: gesture}));
}

function handleDispatchBackScanning(gesture){
    // dispatch back scanning event if conditions are met
    if(gesture === getChosenBackScanningGesture() && !selectorIsLocked())
        document.dispatchEvent(new CustomEvent('backScanning', {detail: gesture}));
}

let intervalId = null;

export function automaticScanning(){
    // function used for automatic scanning
    // function gets executed every interval milliseconds set by the user 
   let interval = getAutomaticScanningInterval();
    intervalId = setInterval(() =>{
        if(!selectorIsLocked() && !getAutomaticIsLocked())
        handleDispatchScanning(gestures.AUTOMATIC)}
        , interval);
}

export function clearAutomaticScanning(){
    // clear the intervalled function
    clearInterval(intervalId);
}