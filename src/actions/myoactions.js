import {getChosenSelectorGesture, getChosenScanningGesture, getChosenBackScanningGesture} from './configactions'
import * as gestures from '../configuration/gestures'
const Myo = require('myo');

var connected = false;
var data, prevData, thirdPoint, translation, firstSection, secondSection,firstRollSection,secondRollSection, flag = false,  bool = false;
var FistInterval;
var MyoInterval = 1000;

let eventType= {
    "Scanning": "scanning",
    "Selection": "selection",
    "BackScanning": "backScanning"
}

export function connectmyo(){
    // connect to Myo
    if(connected === false){
        Myo.connect('com.myojs.default');
        connected = true;
    }
}

Myo.on('disconnected', function(){
    //set Myo connected to false
    connected = false;
});

Myo.on('connected', function(o){
    // set an interval that checks for myo data every second that trigger Myo selected actions
    Myo.setLockingPolicy("none");
    setInterval(function(){
        let chosenScanningGesture = getChosenScanningGesture();
        let chosenBackScanningGesture = getChosenBackScanningGesture();
        let chosenSelector = getChosenSelectorGesture();
        // switch statement on chosen selection gesture and call function to handle gesture recognizition
        switch(chosenSelector){
            case gestures.MYO_POSITION_UP: handleMyoPitch(gestures.MYO_POSITION_UP,data);break;
            case gestures.MYO_POSITION_DOWN: handleMyoPitch(gestures.MYO_POSITION_DOWN,data);break;
            case gestures.MYO_ROLL_LEFT: handleMyoRoll(gestures.MYO_ROLL_LEFT,data);break;
            case gestures.MYO_ROLL_RIGHT: handleMyoRoll(gestures.MYO_ROLL_RIGHT,data);break;
            default: break;
        }
        // switch statement on chosen scanning gesture and call function to handle gesture recognizition
        switch(chosenScanningGesture){
            case gestures.MYO_POSITION_UP: handleMyoPitch(gestures.MYO_POSITION_UP,data);break;
            case gestures.MYO_POSITION_DOWN: handleMyoPitch(gestures.MYO_POSITION_DOWN,data);break;
            case gestures.MYO_ROLL_LEFT: handleMyoRoll(gestures.MYO_ROLL_LEFT,data);break;
            case gestures.MYO_ROLL_RIGHT: handleMyoRoll(gestures.MYO_ROLL_RIGHT,data);break;
            default: break;
        }
        // switch statement on chosen back scanning gesture and call function to handle gesture recognizition
        switch(chosenBackScanningGesture){
            case gestures.MYO_POSITION_UP: handleMyoPitch(gestures.MYO_POSITION_UP,data);break;
            case gestures.MYO_POSITION_DOWN: handleMyoPitch(gestures.MYO_POSITION_DOWN,data);break;
            case gestures.MYO_ROLL_LEFT: handleMyoRoll(gestures.MYO_ROLL_LEFT,data);break;
            case gestures.MYO_ROLL_RIGHT: handleMyoRoll(gestures.MYO_ROLL_RIGHT,data);break;
            default: break;
        }
    }, MyoInterval);

    //Interval of Myo Custom gestures with different interval time
    setInterval(function(){
        let chosenScanningGesture = getChosenScanningGesture();
        let chosenBackScanningGesture = getChosenBackScanningGesture();
        let chosenSeelctor = getChosenSelectorGesture();
        // switch statement on chosen selection gesture and call function to handle gesture recognizition
        switch(chosenSeelctor){
            case gestures.MYO_SWIPE_RIGHT: handleMyoSwipe(gestures.MYO_SWIPE_RIGHT,data);break;
            case gestures.MYO_SWIPE_LEFT: handleMyoSwipe(gestures.MYO_SWIPE_LEFT,data);break;
            case gestures.MYO_ROW: handleMyoCustom();break;
            default: break;
        }
        // switch statement on chosen scanning gesture and call function to handle gesture recognizition
        switch(chosenScanningGesture){
            case gestures.MYO_SWIPE_RIGHT: handleMyoSwipe(gestures.MYO_SWIPE_RIGHT,data);break;
            case gestures.MYO_SWIPE_LEFT: handleMyoSwipe(gestures.MYO_SWIPE_LEFT,data);break;
            case gestures.MYO_ROW: handleMyoCustom();break;
            default: break;
        }
        // switch statement on chosen back scanning gesture and call function to handle gesture recognizition
        switch(chosenBackScanningGesture){
            case gestures.MYO_SWIPE_RIGHT: handleMyoSwipe(gestures.MYO_SWIPE_RIGHT,data);break;
            case gestures.MYO_SWIPE_LEFT: handleMyoSwipe(gestures.MYO_SWIPE_LEFT,data);break;
            case gestures.MYO_POSITION_UP: handleMyoPitch(gestures.MYO_POSITION_UP,data);break;
            case gestures.MYO_ROW: handleMyoCustom();break;
            default: break;
        }
    }, 500);

    //An interval to store previous Myo data 
    setInterval(function(){
        thirdPoint = prevData;
        prevData = data;
    },400);
});

Myo.on('orientation', function(o){
    //updates data to current EulerAngles, this updates everytime there is an orientation change
    data = getEulerAngles(o);
});

function getEulerAngles(q){
    //returning the roll, pitch and yaw data as object
	return {
		roll : Math.atan2(2.0*(q.y*q.z + q.w*q.x), q.w*q.w - q.x*q.x - q.y*q.y + q.z*q.z),
		pitch : Math.asin(-2.0*(q.x*q.z - q.w*q.y)),
		yaw : Math.atan2(2.0*(q.x*q.y + q.w*q.z), q.w*q.w + q.x*q.x - q.y*q.y - q.z*q.z)
	}
}

//Custom function to handle Myo Swipe
function handleMyoSwipe(type,data){ 
    translation = prevData.yaw-data.yaw; //get the difference between current data and previous data
    if(type === gestures.MYO_SWIPE_RIGHT){
        if((translation>0.1 && translation<2)||(translation>5.5)){
            //if the difference is in range with the given sensitivity configurations than trigger Myo Swipe Event
            handleMyoEvent('MYO_SWIPE_RIGHT');}
    }
    if(type === gestures.MYO_SWIPE_LEFT){
        if((translation<-0.1 && translation>-2)||(translation<-5.5)){
            // switch statement on chosen back scanning gesture and call function to handle gesture recognizition
            handleMyoEvent('MYO_SWIPE_LEFT');
        }
    }
}

//Custom function to handle Mup Position Up and Down
function handleMyoPitch(type,data){
    if(type === gestures.MYO_POSITION_UP){
        if(data.pitch >= 1){ //gets the current pitch of the Myo device and checks it's direction
            handleMyoEvent('MYO_POSITION_UP');
        }
    }
    if(type === gestures.MYO_POSITION_DOWN){
        if(data.pitch <= -1){ //gets the current pitch of the Myo device and checks it's direction
            handleMyoEvent('MYO_POSITION_DOWN');
        }
    }
}

//custom function that handles Myo Roll
function handleMyoRoll(type,data){
    /* three points are stored to calculate the difference between them. The event is triggered if the 
    difference in the first data points is positive and the second data points is negative and vice-versa for Left/Right */
    firstRollSection = prevData.roll - thirdPoint.roll;
    secondRollSection = data.roll - prevData.roll;
    if(type === gestures.MYO_ROLL_LEFT){
        if(firstRollSection>0.3 || flag === true){
            flag=true;
            if(secondRollSection<-0.3){
                flag = false;
            }else{
                handleMyoEvent('MYO_ROLL_LEFT');
            }
        }else if(firstRollSection<-0.3){
            flag=false;
        }
    }
    if(type === gestures.MYO_ROLL_RIGHT){
        if(firstRollSection<-0.3 || flag === true){
            flag=true;
            if(secondRollSection>0.3){
                flag = false;
            }else{
                handleMyoEvent('MYO_ROLL_RIGHT');
            }
        }else if(firstRollSection>0.3){
            flag=false;
        }
    }
}

//custom function that handle Myo Hand Roll
function handleMyoCustom(){
    //retreives data of three points and calculates the differences
    firstSection = prevData.pitch - thirdPoint.pitch;
    secondSection = data.pitch - prevData.pitch;
    if(firstSection>0.3 && bool === false){
        if(secondSection>0.1){
            bool=true;
        }else if(secondSection<-0.3){
            handleMyoEvent('MYO_ROW');
        }
    }else if(firstSection<-0.1 && bool === true){
        bool=false;
        handleMyoEvent('MYO_ROW');
    }
}

//Triggers the respective dispatch event
function handleMyoEvent(type){
    if(getChosenSelectorGesture() === type){
        document.dispatchEvent(new CustomEvent(eventType.Selection, {detail: type}));
    }
    if(getChosenScanningGesture() === type){
        document.dispatchEvent(new CustomEvent(eventType.Scanning, {detail: type}));
    }
    if(getChosenBackScanningGesture() === type){
        document.dispatchEvent(new CustomEvent(eventType.BackScanning, {detail: type}));
    }
}

//Myo Fist gesture
Myo.on('fist', function(){
    handleMyoEvent('MYO_FIST');
    //interval was used so that if the user keeps a gesture position it will continue handling the event
    FistInterval = setInterval(function(){
        handleMyoEvent('MYO_FIST');
    }, MyoInterval);
});


Myo.on('fist_off', function(){
    //clear interval is to remove the fist event interval
    clearInterval(FistInterval);
})

//Myo Fingers Spread gesture
Myo.on('fingers_spread', function(){
    handleMyoEvent('MYO_SPREAD');
    FistInterval = setInterval(function(){
        handleMyoEvent('MYO_SPREAD');
    }, MyoInterval);
});

Myo.on('fingers_spread_off', function(){
    clearInterval(FistInterval);
})

//Myo wave in gesture
Myo.on('wave_in', function(){
    handleMyoEvent('MYO_WAVE_IN');
    FistInterval = setInterval(function(){
        handleMyoEvent('MYO_WAVE_IN');
    }, MyoInterval);
});

Myo.on('wave_in_off', function(){
    clearInterval(FistInterval);
})

//Myo wave out gesture
Myo.on('wave_out', function(){
    handleMyoEvent('MYO_WAVE_OUT');
    FistInterval = setInterval(function(){
        handleMyoEvent('MYO_WAVE_OUT');
    }, MyoInterval);
});

Myo.on('wave_out_off', function(){
    clearInterval(FistInterval);
})

//Myo double tap gesture
Myo.on('double_tap', function(){
    handleMyoEvent('MYO_DOUBLE_TAP');
    FistInterval = setInterval(function(){
        handleMyoEvent('MYO_DOUBLE_TAP');
    }, MyoInterval);
});

Myo.on('double_tap_off', function(){
    clearInterval(FistInterval);
})


