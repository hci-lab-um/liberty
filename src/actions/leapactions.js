import {getLeapInterval, getChosenSelectorGesture, getChosenScanningGesture, getChosenBackScanningGesture, selectorIsLocked, lockSelector, setAutomaticIsLocked} from './configactions'
import * as types from '../configuration/gestures'
const Leap = require('leapjs')

var controller = new Leap.Controller();
var circleBuffer = 0;
let intervalId = null;

let eventType= {
    "Scanning": "scanning",
    "Selection": "selection",
    "BackScanning": "backScanning"
}

export function leapConnect(){
    // connect to LEAP Motion controller
    controller.connect();
}

export function leapDisconnect(){
    // Disconnect from LEAP Motion controller and clear the intervalled function
    controller.disconnect();
    clearInterval(intervalId);
    return Promise.resolve();
}

controller.on('connect', function(){
    let interval = getLeapInterval();
    /* Execute function which handles data read from the LEAP Motion controller and recognizes the gestures in
       an interval defined by the user */
    intervalId = setInterval(function(){
        let chosenScanningGesture = getChosenScanningGesture();
        let chosenBackScanningGesture = getChosenBackScanningGesture();
        let chosenSelectionGesture = getChosenSelectorGesture();
        var frame = controller.frame(); // get current frame of data from LEAP Motion Controller
        var previouseframe = controller.frame(30); // get a previous frame 30 frames back
        if(typeof frame.hands[0] !== 'undefined' && !selectorIsLocked()){
            setAutomaticIsLocked(true); // lock automatic scanning so that it does not interfere
            // switch statement on chosen selection gesture and call function to handle gesture recognizition
            switch(chosenSelectionGesture){
                case types.HAND_GRAB: handleGrab(eventType.Selection, frame); break;
                case types.HAND_PINCH: handlePinch(eventType.Selection,frame); break;
                case types.SWIPE_RIGHT: handleSwipeRight(eventType.Selection, frame, previouseframe);break;
                case types.SWIPE_LEFT: handleSwipeLeft(eventType.Selection, frame, previouseframe);break;
                case types.ROLL_RIGHT: handleRollRight(eventType.Selection,frame);break;
                case types.ROLL_LEFT: handleRollLeft(eventType.Selection,frame);break;
                case types.HAND_POINT_RIGHT:
                case types.HAND_POINT_LEFT:
                case types.HAND_POINT_UP:
                case types.HAND_POINT_DOWN:
                case types.HAND_POINT_FRONT:
                case types.HAND_POINT_BACK: handleHandPoint(chosenSelectionGesture, eventType.Selection, frame);break;
                case types.PALM_POINT_RIGHT:
                case types.PALM_POINT_LEFT:
                case types.PALM_POINT_UP:
                case types.PALM_POINT_DOWN:
                case types.PALM_POINT_FRONT:
                case types.PALM_POINT_BACK: handlePalmPoint(chosenSelectionGesture, eventType.Selection, frame);break;
                case types.HAND_POSITION_RIGHT:
                case types.HAND_POSITION_LEFT:
                case types.HAND_POSITION_UP:
                case types.HAND_POSITION_DOWN:
                case types.HAND_POSITION_FRONT:
                case types.HAND_POSITION_BACK: handleHandPosition(chosenSelectionGesture, eventType.Selection, frame);break;
                default: break;
            }
            // switch statement on chosen scanning gesture and call function to handle gesture recognizition
            switch(chosenScanningGesture){
                case types.HAND_GRAB: handleGrab(eventType.Scanning,frame); break;
                case types.HAND_PINCH: handlePinch(eventType.Scanning,frame); break;
                case types.SWIPE_RIGHT: handleSwipeRight(eventType.Scanning, frame, previouseframe);break;
                case types.SWIPE_LEFT: handleSwipeLeft(eventType.Scanning, frame, previouseframe);break;
                case types.ROLL_RIGHT: handleRollRight(eventType.Scanning,frame);break;
                case types.ROLL_LEFT: handleRollLeft(eventType.Scanning,frame);break;
                case types.CIRCLE: handleCircle(eventType.Scanning,frame);break;
                case types.HAND_POINT_RIGHT:
                case types.HAND_POINT_LEFT:
                case types.HAND_POINT_UP:
                case types.HAND_POINT_DOWN:
                case types.HAND_POINT_FRONT:
                case types.HAND_POINT_BACK: handleHandPoint(chosenScanningGesture, eventType.Scanning, frame);break;
                case types.PALM_POINT_RIGHT:
                case types.PALM_POINT_LEFT:
                case types.PALM_POINT_UP:
                case types.PALM_POINT_DOWN:
                case types.PALM_POINT_FRONT:
                case types.PALM_POINT_BACK: handlePalmPoint(chosenScanningGesture, eventType.Scanning, frame);break;
                case types.HAND_POSITION_RIGHT:
                case types.HAND_POSITION_LEFT:
                case types.HAND_POSITION_UP:
                case types.HAND_POSITION_DOWN:
                case types.HAND_POSITION_FRONT:
                case types.HAND_POSITION_BACK: handleHandPosition(chosenScanningGesture, eventType.Scanning, frame);break;
                default: break;
            }
            // switch statement on chosen back scanning gesture and call function to handle gesture recognizition
            switch(chosenBackScanningGesture){
                case types.HAND_GRAB: handleGrab(eventType.BackScanning,frame); break;
                case types.HAND_PINCH: handlePinch(eventType.BackScanning,frame); break;
                case types.SWIPE_RIGHT: handleSwipeRight(eventType.BackScanning, frame, previouseframe);break;
                case types.SWIPE_LEFT: handleSwipeLeft(eventType.BackSelebAction, frame, previouseframe);break;
                case types.ROLL_RIGHT: handleRollRight(eventType.BackScanning,frame);break;
                case types.ROLL_LEFT: handleRollLeft(eventType.BackScanning,frame);break;
                case types.HAND_POINT_RIGHT:
                case types.HAND_POINT_LEFT:
                case types.HAND_POINT_UP:
                case types.HAND_POINT_DOWN:
                case types.HAND_POINT_FRONT:
                case types.HAND_POINT_BACK: handleHandPoint(chosenBackScanningGesture, eventType.BackScanning, frame);break;
                case types.PALM_POINT_RIGHT:
                case types.PALM_POINT_LEFT:
                case types.PALM_POINT_UP:
                case types.PALM_POINT_DOWN:
                case types.PALM_POINT_FRONT:
                case types.PALM_POINT_BACK: handlePalmPoint(chosenBackScanningGesture, eventType.BackScanning, frame);break;
                case types.HAND_POSITION_RIGHT:
                case types.HAND_POSITION_LEFT:
                case types.HAND_POSITION_UP:
                case types.HAND_POSITION_DOWN:
                case types.HAND_POSITION_FRONT:
                case types.HAND_POSITION_BACK: handleHandPosition(chosenBackScanningGesture, eventType.BackScanning, frame);break;
                default: break;
            }
            setAutomaticIsLocked(false); // unlock automatic scanning
        }
    }, interval);
});

function handleGrab(eventTypeIn, frame){
    // recognize the grab gesture
    if(frame.hands[0].grabStrength === 1)
        document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.HAND_GRAB}));
}

function handlePinch(eventTypeIn, frame){
    // recognize the pinch gesture
    if(frame.hands[0].pinchStrength === 1)
        document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.HAND_PINCH}));
}

function handleSwipeRight(eventTypeIn, frame, previouseframe){
    // recognize the swipe right gesture
    if(typeof frame.hands[0] !== 'undefined' && previouseframe.hands[0] !== 'undefined'){
        var currenthand = frame.hands[0];
        var previoushand = previouseframe.hands[0];
        var xoffset = 15;
        if(typeof previoushand !== 'undefined'){
            var currentpos = Math.round(currenthand.palmPosition[0]);
            var previouspos = Math.round(previoushand.palmPosition[0]);
            /* if there is a certain offset between the position of the hand in the current frame
               and the position of the hand in the previous frame than the swipe right gesture is recognized */
            if((currentpos-previouspos)>xoffset){
                // dispatch either scanning / back scanning / selection event
                document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.SWIPE_RIGHT}));
            }
        }
    }
}

function handleSwipeLeft(eventTypeIn, frame, previouseframe){
    // recognize the swipe left gesture
    if(typeof frame.hands[0] !== 'undefined' && previouseframe.hands[0] !== 'undefined'){
        var currenthand = frame.hands[0];
        var previoushand = previouseframe.hands[0];
        var xoffset = -15;
        if(typeof previoushand !== 'undefined'){
            var currentpos = Math.round(currenthand.palmPosition[0]);
            var previouspos = Math.round(previoushand.palmPosition[0]);
            /* if there is a certain offset between the position of the hand in the current frame
               and the position of the hand in the previous frame than the swipe left gesture is recognized */
            if((currentpos-previouspos)<xoffset){
                document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.SWIPE_LEFT}));
            }
        }
    }
}

function handleRollRight(eventTypeIn, frame){
    // recognize the roll right gesture
    const TO_RAD = Math.PI / 180;
    const TO_DEG = 1 / TO_RAD; // the number to multiply by to get the degrees value
    for (var i in frame.handsMap) {
        var hand = frame.handsMap[i];
        var roll = hand.roll()*TO_DEG; // get degree value of roll
        // if there is a certain amount of degrees then roll right gesture is recognized
        if((roll>20&&roll<50)||roll<-125){
            document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.ROLL_RIGHT})) 
        }
    }
}

function handleRollLeft(eventTypeIn, frame){
    // recognize roll left gesture
    const TO_RAD = Math.PI / 180;
    const TO_DEG = 1 / TO_RAD;
    for (var i in frame.handsMap) {
        var hand = frame.handsMap[i];
        var roll = hand.roll()*TO_DEG;
        // if there is a certain amount of degrees then roll left gesture is recognized
        if((roll<-15&&roll>-45)||roll>125){
            document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.ROLL_LEFT})) 
        }
    }
}

function handleCircle(eventTypeIn, frame){
    // recognize the circle gesture
    frame.gestures.forEach(function(gesture){
     // in-built gesture circle
        if(gesture.type === 'circle')
            // the circle gesture has to be recognized twice
            if(circleBuffer>2){
                document.dispatchEvent(new CustomEvent(eventTypeIn, {detail: types.CIRCLE}));
                circleBuffer = 0;
            }
            circleBuffer++;
    });  
}

function handleHandPoint(moveType, eventTypeIn, frame){
    // recognized hand pointing gestures
    let directionX = Math.round(frame.hands[0].direction[0]); // hand pointing in the x-plane
    let directionY = Math.round(frame.hands[0].direction[1]); // hand pointing in the y-plane
    let directionZ = Math.round(frame.hands[0].direction[2]); // hand pointing in the z-plane

    let conditionIsTrue = false;
    // switch depending on gesture that is being recognized
    // gesture is recognized if a corrsponding direction value is equal to a certain value
    switch(moveType){
        case types.HAND_POINT_BACK:
            if(directionZ === 1)
                conditionIsTrue = true;
            break;
        case types.HAND_POINT_FRONT:
            if(directionZ === -1)
                conditionIsTrue = true;
            break;
        case types.HAND_POINT_DOWN:
            if(directionY === -1)
                conditionIsTrue = true;
            break;
        case types.HAND_POINT_UP:
            if(directionY === 1)
                conditionIsTrue = true;
            break;
        case types.HAND_POINT_LEFT:
            if(directionX === -1)
                conditionIsTrue = true;
            break;
        case types.HAND_POINT_RIGHT:
            if(directionX === 1)
                conditionIsTrue = true;
            break;
        default:
        console.log('CASE NOT DEFINED');
    }

    // dispatch corresponding event if condition holds
    if(conditionIsTrue){
        if(eventTypeIn === eventType.Scanning)
            handleDispatchScanning(moveType);
        else if(eventTypeIn === eventType.Selection)
            hanleDispatchSelection(moveType);
        else if(eventTypeIn === eventType.BackScanning)
            handleDispatchBackScanning(moveType);
    }
}

function handlePalmPoint(moveType, eventTypeIn, frame){
    // recognize palm pointing gestures
    let palmNormX = Math.round(frame.hands[0].palmNormal[0]); // palm pointing in the x-plane
    let palmNormY = Math.round(frame.hands[0].palmNormal[1]); // palm pointing in the y-pane
    let palmNormZ = Math.round(frame.hands[0].palmNormal[2]); // palm pointing in the z-plane

    let conditionIsTrue = false;
    // switch depending on gesture that is being recognized
    // gesture is recognized if a corrsponding palm normal value is equal to a certain value
    switch(moveType){
        case types.PALM_POINT_BACK:
            if(palmNormZ === 1)
                conditionIsTrue = true;
            break;
        case types.PALM_POINT_FRONT:
            if(palmNormZ === -1)
                conditionIsTrue = true;
            break;
        case types.PALM_POINT_DOWN:
            if(palmNormY === -1)
                conditionIsTrue = true;
            break;
        case types.PALM_POINT_UP:
            if(palmNormY === 1)
                conditionIsTrue = true;
            break;
        case types.PALM_POINT_LEFT:
            if(palmNormX === -1)
                conditionIsTrue = true;
            break;
        case types.PALM_POINT_RIGHT:
            if(palmNormX === 1)
                conditionIsTrue = true;
            break;
        default:
            console.log('CASE NOT DEFINED');
    }

    // dispatch corresponding event if condition is met
    if(conditionIsTrue){
        if(eventTypeIn === eventType.Scanning)
            handleDispatchScanning(moveType);
        else if(eventTypeIn === eventType.Selection)
            hanleDispatchSelection(moveType);
        else if(eventTypeIn === eventType.BackScanning)
            handleDispatchBackScanning(moveType);
    }
}

function handleHandPosition(moveType, eventTypeIn, frame){
    // recognizing hand position in relation to the LEAP controller's position gestures
    let palmPosX = Math.round(frame.hands[0].palmPosition[0]); // palm position in the x-plane
    let palmPosY = Math.round(frame.hands[0].palmPosition[1]); // palm position in the y-pane
    let palmPosZ = Math.round(frame.hands[0].palmPosition[2]); // palm position in the z-plane

    let conditionIsTrue = false;
    // switch depending on gesture that is being recognized
    // gesture is recognized if a corrsponding palm position value is smaller or greater than a certain value
    switch(moveType){
        case types.HAND_POSITION_BACK:
            if(palmPosZ > 100)
                conditionIsTrue = true;
            break;
        case types.HAND_POSITION_FRONT:
            if(palmPosZ <= -100)
                conditionIsTrue = true;
            break;
        case types.HAND_POSITION_DOWN:
            if(palmPosY < 200)
                conditionIsTrue = true;
            break;
        case types.HAND_POSITION_UP:
            if(palmPosY >= 200)
                conditionIsTrue = true;
            break;
        case types.HAND_POSITION_LEFT:
            if(palmPosX <= -100)
                conditionIsTrue = true;
            break;
        case types.HAND_POSITION_RIGHT:
            if(palmPosX >= 100)
                conditionIsTrue = true;
            break;
        default:
            console.log('CASE NOT DEFINED');
    }

    // dispatch corresponding event if condition is met
    if(conditionIsTrue){
        if(eventTypeIn === eventType.Scanning)
            handleDispatchScanning(moveType);
        else if(eventTypeIn === eventType.Selection)
            hanleDispatchSelection(moveType);
        else if(eventTypeIn === eventType.BackScanning)
            handleDispatchBackScanning(moveType);
    }
}

// dispatch selection event
function hanleDispatchSelection(gesture){
    if(gesture === getChosenSelectorGesture() && !selectorIsLocked()){
        lockSelector();
        document.dispatchEvent(new CustomEvent('selection', {detail: gesture}));
    }
}

// dispatch scanning event
function handleDispatchScanning(gesture){
    if(gesture === getChosenScanningGesture()){
        document.dispatchEvent(new CustomEvent('scanning', {detail: gesture}));
    }
}

// dispatch back scanning event
function handleDispatchBackScanning(gesture){
    console.log(gesture);
    if(gesture === getChosenBackScanningGesture()){
        document.dispatchEvent(new CustomEvent('backScanning', {detail: gesture}));
    }
}
