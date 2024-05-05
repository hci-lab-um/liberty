import React, { Component } from 'react'
import { Modal, Input, Form, Divider, Dropdown, Checkbox } from 'semantic-ui-react';
import { changeConfig, getChosenScanningGesture, getChosenBackScanningGesture, getChosenSelectorGesture, getScanningType, getHighlightColor, getAutomaticScanningInterval, getTransition, getLeapInterval, lockSelector, unlockSelector, getRegionScanningRows, getRegionScanningColumns, getDefaultVocabularyPath, getHoverDuration, getDwellAnimation, getEyeTrackingOption } from '../actions/configactions';
import * as gestures from '../configuration/gestures.js';
import * as scanningTypes from '../configuration/scanningtypes.js'
const {ipcRenderer} = window.require('electron')

class ConfigBoardModal extends Component {

    // definition of scanning types to include scanning type name in title case
    scanningType = [
        {text: 'Step Scanning', value: scanningTypes.STEP_SCANNING},
        {text: 'Row based Scanning', value: scanningTypes.ROW_BASED_SCANNING},
        {text: 'Column based Scanning', value: scanningTypes.COLUMN_BASED_SCANNING},
        {text: 'Region based Scanning', value: scanningTypes.REGION_BASED_SCANNING},
        {text: 'Division based Scanning', value: scanningTypes.DIVISION_BASED_SCANNING},
        {text: 'Mouse Scanning', value: scanningTypes.MOUSE_SCANNING}
    ]

    // definition of gesture type to include gesture name in title case and corresponding icon
    gestureType = [
        {text: 'None', value: 'NONE'},
        {text: 'Spacebar', value: gestures.SPACEBAR, icon: 'keyboard'},
        {text: 'Left Click', value: gestures.LEFT_CLICK, icon: 'keyboard'},
        {text: 'Center Click', value: gestures.CENTER_CLICK, icon: 'keyboard'},
        {text: 'Right Click', value: gestures.RIGHT_CLICK, icon: 'keyboard'},
        {text: 'Enter', value: gestures.ENTER, icon: 'keyboard'},
        {text: 'Left Arrow', value: gestures.LEFT_ARROW, icon: 'keyboard'},
        {text: 'Right Arrow', value: gestures.RIGHT_ARROW, icon: 'keyboard'},
        {text: 'Automatic', value: gestures.AUTOMATIC},
        {text: 'Palm Point Left', value: gestures.PALM_POINT_LEFT, icon: 'signing'},
        {text: 'Palm Point Right', value: gestures.PALM_POINT_RIGHT, icon: 'signing'},
        {text: 'Palm Point Up', value: gestures.PALM_POINT_UP, icon: 'signing'},
        {text: 'Palm Point Down', value: gestures.PALM_POINT_DOWN, icon: 'signing'},
        {text: 'Palm Point Front', value: gestures.PALM_POINT_FRONT, icon: 'signing'},
        {text: 'Palm Point Back', value: gestures.PALM_POINT_BACK, icon: 'signing'},
        {text: 'Hand Point Left', value: gestures.HAND_POINT_LEFT, icon: 'signing'},
        {text: 'Hand Point Right', value: gestures.HAND_POINT_RIGHT, icon: 'signing'},
        {text: 'Hand Point Up', value: gestures.HAND_POINT_UP, icon: 'signing'},
        {text: 'Hand Point Down', value: gestures.HAND_POINT_DOWN, icon: 'signing'},
        {text: 'Hand Point Front', value: gestures.HAND_POINT_FRONT, icon: 'signing'},
        {text: 'Hand Point Back', value: gestures.HAND_POINT_BACK, icon: 'signing'},
        {text: 'Hand Position Left', value: gestures.HAND_POSITION_LEFT, icon: 'signing'},
        {text: 'Hand Position Right', value: gestures.HAND_POSITION_RIGHT, icon: 'signing'},
        {text: 'Hand Position Up', value: gestures.HAND_POSITION_UP, icon: 'signing'},
        {text: 'Hand Position Down', value: gestures.HAND_POSITION_DOWN, icon: 'signing'},
        {text: 'Hand Position Front', value: gestures.HAND_POSITION_FRONT, icon: 'signing'},
        {text: 'Hand Position Back', value: gestures.HAND_POSITION_BACK, icon: 'signing'},
        {text: 'Hand Grab', value: gestures.HAND_GRAB, icon: 'signing'},
        {text: 'Hand Pinch', value: gestures.HAND_PINCH, icon: 'signing'},
        {text: 'Swipe Right', value: gestures.SWIPE_RIGHT, icon: 'signing'},
        {text: 'Swipe Left', value: gestures.SWIPE_LEFT, icon: 'signing'},
        {text: 'Roll Right', value: gestures.ROLL_RIGHT, icon: 'signing'},
        {text: 'Roll Left', value: gestures.ROLL_LEFT, icon: 'signing'},
        {text: 'Myo Fist', value: gestures.MYO_FIST, icon: 'band aid'},
        {text: 'Myo Spread', value: gestures.MYO_SPREAD, icon: 'band aid'},
        {text: 'Myo Wave In', value: gestures.MYO_WAVE_IN, icon: 'band aid'},
        {text: 'Myo Wave Out', value: gestures.MYO_WAVE_OUT, icon: 'band aid'},
        {text: 'Myo Double Tap', value: gestures.MYO_DOUBLE_TAP, icon: 'band aid'},
        {text: 'Myo Swipe Right', value: gestures.MYO_SWIPE_RIGHT, icon: 'band aid'},
        {text: 'Myo Swipe Left', value: gestures.MYO_SWIPE_LEFT, icon: 'band aid'},
        {text: 'Myo Position Up', value: gestures.MYO_POSITION_UP, icon: 'band aid'},
        {text: 'Myo Position Down', value: gestures.MYO_POSITION_DOWN, icon: 'band aid'},
        {text: 'Myo Roll Right', value: gestures.MYO_ROLL_RIGHT, icon: 'band aid'},
        {text: 'Myo Roll Left', value: gestures.MYO_ROLL_LEFT, icon: 'band aid'},
        {text: 'Myo Row Hand', value: gestures.MYO_ROW, icon: 'band aid'}
    ]

    leapTypes = [
        gestures.HAND_GRAB, gestures.HAND_PINCH, gestures.HAND_POINT_BACK, gestures.HAND_POINT_FRONT,
        gestures.HAND_POINT_DOWN, gestures.HAND_POINT_UP, gestures.HAND_POINT_LEFT, gestures.HAND_POINT_RIGHT,
        gestures.HAND_POSITION_BACK, gestures.HAND_POSITION_FRONT, gestures.HAND_POSITION_DOWN, gestures.HAND_POSITION_UP, 
        gestures.HAND_POSITION_LEFT, gestures.HAND_POSITION_RIGHT, gestures.PALM_POINT_BACK, gestures.PALM_POINT_FRONT,
        gestures.PALM_POINT_DOWN, gestures.PALM_POINT_UP, gestures.PALM_POINT_LEFT, gestures.PALM_POINT_RIGHT,
        gestures.SWIPE_LEFT, gestures.SWIPE_RIGHT, gestures.CIRCLE, gestures.SWIPE_RIGHT, gestures.SWIPE_LEFT, gestures.ROLL_RIGHT, gestures.ROLL_LEFT
    ]

    hoverTimeOptions = [
        { text: '1 second', value: 1000 },
        { text: '2 seconds', value: 2000 },
        { text: '3 seconds', value: 3000 },
        { text: '4 seconds', value: 4000 },
        { text: '5 seconds', value: 5000 }
    ];

    eyeTracking = ['eyetracker', 'webcam']
    transitions = ['jiggle', 'flash', 'shake', 'pulse', 'tada', 'bounce', 'glow']
    colors = ['red', 'yellow', 'orange',  'olive', 'green', 'teal', 'blue', 'violet', 'purple', 'brown', 'grey', 'pink']  
    dwellAnimations = ['fill-up', 'horizontal-out']
    
    transitionOptions = this.transitions.map(name => ({ key: name, text: name, value: name }))
    eyeTrackingOptions = this.eyeTracking.map(name => ({ key: name, text: name, value: name }))
    colorOptions = this.colors.map(name => ({text: name, value: name, color: name}));
    dwellAnimationOptions = this.dwellAnimations.map(name => ({text: name, value: name, color: name}));

    constructor(props){
        super(props);
        // state holds all editable configurations
        this.state = {
            configBoardModalOpen: false,
            leapIntervalOpen: false,
            chosenScanningGesture: getChosenScanningGesture(),
            chosenBackScanningGesture: getChosenBackScanningGesture(),
            chosenSelectorGesture: getChosenSelectorGesture(),
            chosenScanningType: getScanningType(),
            color: getHighlightColor(),
            automaticScanningInterval: getAutomaticScanningInterval(),
            leapInterval: getLeapInterval(),
            transition: getTransition(),
            automaticHidden: false,
            leapHidden: false,
            addVocabulary: getDefaultVocabularyPath(),
            regionScanningRows: getRegionScanningRows(),
            regionScanningColumns: getRegionScanningColumns(),
            regionsHidden: true,
            hoverDuration: getHoverDuration(),
            eyeTrackingOption : getEyeTrackingOption(),
            dwellAnimation: getDwellAnimation(),
        }

        // definie binding of methods
        this.closeConfigBoardModal = this.closeConfigBoardModal.bind(this);
        this.openConfigBoardModal = this.openConfigBoardModal.bind(this);
        this.saveConfiguration = this.saveConfiguration.bind(this);
        this.handleAutomaticIntervalChange = this.handleAutomaticIntervalChange.bind(this);
        this.handleLeapIntervalChange = this.handleLeapIntervalChange.bind(this);
        this.handleScanningTypeChange = this.handleScanningTypeChange.bind(this);
        this.handleScanningGestureChange = this.handleScanningGestureChange.bind(this);
        this.handleBackScanningGestureChange = this.handleBackScanningGestureChange.bind(this);
        this.handleSelectorGestureChange = this.handleSelectorGestureChange.bind(this);
        this.handleModalOpen = this.handleModalOpen.bind(this);
        this.isLeapConfiguration = this.isLeapConfiguration.bind(this);
        this.handleColorChange = this.handleColorChange.bind(this);
        this.handleEyeTrackingOptionChange = this.handleEyeTrackingOptionChange.bind(this)
        this.handleHoverDurationChange = this.handleHoverDurationChange.bind(this);
        this.handleDwellAnimationChange = this.handleDwellAnimationChange.bind(this);
        this.automaticShow = this.automaticShow.bind(this);
        this.leapShow = this.leapShow.bind(this);
        this.validateScanningGesture = this.validateScanningGesture.bind(this);
        this.validateBackScanningGesture = this.validateBackScanningGesture.bind(this);
        this.validateSelectorGesture = this.validateSelectorGesture.bind(this);
        this.handleVocabularyLoad = this.handleVocabularyLoad.bind(this);
        this.handleChangeDefaultVocabulary = this.handleChangeDefaultVocabulary.bind(this);        
    }

    handleModalOpen(){
        // get all the configuration values when the modal opens
        this.setState({
            chosenScanningType: getScanningType(),
            chosenSelectorGesture: getChosenSelectorGesture(),
            chosenScanningGesture: getChosenScanningGesture(),
            chosenBackScanningGesture: getChosenBackScanningGesture(),
            color: getHighlightColor(),
            hoverDuration: getHoverDuration(),
            dwellAnimation: getDwellAnimation(),
            eyeTrackingOption: getEyeTrackingOption(),
            automaticScanningInterval: getAutomaticScanningInterval(),
            leapInterval: getLeapInterval(),
            transition: getTransition(),
            regionScanningRows: getRegionScanningRows(),
            regionScanningColumns: getRegionScanningColumns(),
            addVocabulary: getDefaultVocabularyPath()
        }, ()=>{
            //show or hide change region columns and rows section
            if(this.state.chosenScanningType === scanningTypes.REGION_BASED_SCANNING)
                this.setState({regionsHidden: false}); 
        });
        lockSelector(); // lock gesture detection
    }

    handleHoverDurationChange=(e, data)=>{
        this.setState({hoverDuration: data.value});
        console.log(this.state.hoverDuration);
        const root = document.documentElement;
        root.style.setProperty('--dwell-time', `${data.value}ms`);
    }

    handleDwellAnimationChange=(e, data)=>{
        this.setState({dwellAnimation: data.value});
        
    }

    handleEyeTrackingOptionChange = (e, data) => {
        console.log("Selected Eye Tracking Option:", data.value);
        this.setState({ eyeTrackingOption: data.value }, () => {
            console.log("State updated. Eye Tracking Option:", this.state.eyeTrackingOption);
        });
    }

    handleColorChange=(e, data)=>{
        this.setState({color: data.value});
    }

    handleTransitionChange=(e, data)=>{
        this.setState({transition: data.value});
    }

    handleScanningTypeChange = (e, data) =>{
        // show change region rows/columns section if region based scanning is selected
        if(data.value === scanningTypes.REGION_BASED_SCANNING){
            this.setState({regionsHidden: false});
        }else{
            this.setState({regionsHidden: true});
        }
        this.setState({chosenScanningType: data.value});
    }

    handleScanningGestureChange = (e, data) =>{
        this.setState({chosenScanningGesture: data.value}, () =>{
            this.leapShow(data.value);
            this.automaticShow(data.value);
            this.validateScanningGesture(data.value);
        });
    }

    handleBackScanningGestureChange = (e, data) =>{
        this.setState({chosenBackScanningGesture: data.value}, () =>{
            this.leapShow(data.value);
            this.validateBackScanningGesture(data.value);
        });
    }

    handleSelectorGestureChange = (e, data) =>{
        this.setState({chosenSelectorGesture: data.value}, () =>{
            this.leapShow(data.value);
            this.validateSelectorGesture(data.value);
        });
    }

    handleRegionScanningRowsChange = (e, data) =>{
        this.setState({regionScanningRows: data.value});
    }

    handleRegionScanningColumnsChange = (e, data) =>{
        this.setState({regionScanningColumns: data.value});
    }

    closeConfigBoardModal(){
        this.setState({configBoardModalOpen: false});
        unlockSelector(); // resume gesture detection
    }

    openConfigBoardModal(){
        this.setState({configBoardModalOpen: true}, ()=>{
            this.handleModalOpen();
        });
    }

    saveConfiguration = (event) => {
        event.preventDefault(); // Prevent default form submission
    
        this.setState({ configBoardModalOpen: false }, () => {
            let isLeap = this.isLeapConfiguration();
            // Construct configuration object
            let configObject = {
                scanningGesture: this.state.chosenScanningGesture,
                selectorGesture: this.state.chosenSelectorGesture,
                backScanningGesture: this.state.chosenBackScanningGesture,
                scanningType: this.state.chosenScanningType,
                highlightColor: this.state.color,
                hoverDuration: this.state.hoverDuration,
                dwellAnimation: this.state.dwellAnimation,
                eyeTrackingOption: this.state.eyeTrackingOption,
                transition: this.state.transition,
                automaticScanningInterval: this.state.automaticScanningInterval,
                leapInterval: this.state.leapInterval,
                isLeap: isLeap,
                vocabularyFile: this.state.addVocabulary,
                regionScanningRows: this.state.regionScanningRows,
                regionScanningColumns: this.state.regionScanningColumns
            };
    
            changeConfig(configObject, true);
    
            unlockSelector();
        });
    }
    
    isLeapConfiguration(){
        // check if one of the gestures selected is a leap gesture
        let scanningGesture= this.state.chosenScanningGesture;
        let backScanningGesture = this.state.chosenBackScanningGesture;
        let selectorGesture = this.state.chosenSelectorGesture;
        if(this.leapTypes.includes(scanningGesture) || this.leapTypes.includes(backScanningGesture) || this.leapTypes.includes(selectorGesture)){
            return true;
        }
        else{
            return false;
        }
    }

    handleAutomaticIntervalChange =(e, data)=>{
        this.setState({automaticScanningInterval: data.value});
    }

    handleLeapIntervalChange =(e, data)=>{
        this.setState({leapInterval: data.value});
    }

    // show section to change automatic scanning interval if automatic gesture is used
    automaticShow =(type)=>{
        if(type == gestures.AUTOMATIC){
            this.setState({automaticHidden: true});
        }else{
            this.setState({automaticHidden: false});
        }
    }

    // show section to change LEAP interval if a LEAP gesture is used
    leapShow =()=>{
        if(this.isLeapConfiguration()){
            this.setState({leapHidden: true});
        }else{
            this.setState({leapHidden: false});
        }
    }

    // validation functions when a mapping for the same gesture already exists
    validateScanningGesture =(type)=>{
        if(type == this.state.chosenBackScanningGesture){
            this.setState({chosenBackScanningGesture: 'NONE'})
        }
        if(type == this.state.chosenSelectorGesture){
            this.setState({chosenSelectorGesture: 'NONE'});
        }
    }

    validateBackScanningGesture =(type)=>{
        if(type == this.state.chosenScanningGesture){
            this.setState({chosenScanningGesture: 'NONE'})
        }
        if(type == this.state.chosenSelectorGesture){
            this.setState({chosenSelectorGesture: 'NONE'});
        }
    }

    validateSelectorGesture =(type)=>{
        if(type == this.state.chosenScanningGesture){
            this.setState({chosenScanningGesture: 'NONE'})
        }
        if(type == this.state.chosenBackScanningGesture){
            this.setState({chosenBackScanningGesture: 'NONE'});
        }
        
    }

    handleVocabularyLoad = (event, vocabularyPath) =>{
        // when main process sends vocabulary path update state
        this.setState({addVocabulary: vocabularyPath});
    }

    handleChangeDefaultVocabulary(){
        // if the user clicks on change default vocabulary button send message to main process to open dialog to select default vocabulary file
        ipcRenderer.send('changeVocabulary');
    }

    componentDidMount(){
        // add listeners when component mounts
        ipcRenderer.on('configBoard', this.openConfigBoardModal);
        ipcRenderer.on('vocabularySent', this.handleVocabularyLoad);
    }

    componentWillUnmount(){
        // remove listeners on unmounting of component
        ipcRenderer.removeListener('configBoard', this.openConfigBoardModal);
        ipcRenderer.removeListener('vocabularySent', this.handleVocabularyLoad);
    }

    isMouseScanning() {
        return this.state.chosenScanningType === scanningTypes.MOUSE_SCANNING; 
    }    

    render() {
        return (
            <Modal open={this.state.configBoardModalOpen} onClose={this.closeConfigBoardModal}>
                <Modal.Header>Configure Board</Modal.Header>
                <Modal.Content>
                    <Form>
                        Scanning Type:
                        <Dropdown id="scanningtype" value={this.state.chosenScanningType} options={this.scanningType} fluid selection onChange={this.handleScanningTypeChange}/>
                        {!this.state.regionsHidden && (
                            <>
                                <div><p>Region Rows:</p><Input type="number" id="regionRows" value={this.state.regionScanningRows} onChange={this.handleRegionScanningRowsChange}/></div>
                                <div><p>Region Columns:</p><Input type="number" id="regionColumns" value={this.state.regionScanningColumns} onChange={this.handleRegionScanningColumnsChange}/></div>
                            </>
                        )}
                        {this.isMouseScanning() ? null : (
                            <>
                                <Divider hidden/>
                                Enter Scanning Gesture:
                                <Dropdown id="text1" value={this.state.chosenScanningGesture} options={this.gestureType} fluid selection onChange={this.handleScanningGestureChange}/>
                                <Divider hidden/>
                                Enter Back Scanning Gesture:
                                <Dropdown id="text2" value={this.state.chosenBackScanningGesture} options={this.gestureType} fluid selection onChange={this.handleBackScanningGestureChange}/>
                                <Divider hidden/>
                                Enter Selector Gesture:
                                <Dropdown id="text3" value={this.state.chosenSelectorGesture} options={this.gestureType} fluid selection onChange={this.handleSelectorGestureChange}/>
                            </>
                        )}
                        {this.isMouseScanning() && (
                            <>
                                <Divider hidden/>
                                Choose Eyetracking Option:
                                <Dropdown value={this.state.eyeTrackingOption} options={this.eyeTrackingOptions} fluid selection onChange={this.handleEyeTrackingOptionChange}/>
                                <Divider hidden/>
                                Enter Dwelling Time:
                                <Dropdown value={this.state.hoverDuration} options={this.hoverTimeOptions} fluid selection onChange={this.handleHoverDurationChange}/>
                                <Divider hidden/>
                                Dwell Animation:
                                <Dropdown value={this.state.dwellAnimation} options={this.dwellAnimationOptions} fluid selection onChange={this.handleDwellAnimationChange}/>
                            </>
                            
                        )}
                        <Divider hidden/>
                        Color:
                        <Dropdown value={this.state.color} options={this.colorOptions} fluid selection onChange={this.handleColorChange}/>
                        <Divider hidden/>
                        Item Transition:
                        <Dropdown value={this.state.transition} options={this.transitionOptions} fluid selection onChange={this.handleTransitionChange}/>
                        <Divider hidden/>
                        {this.state.automaticHidden && <div><p>Speed of Automatic Selector (in ms):</p><Input type="text" id="speed" value={this.state.automaticScanningInterval} onChange={this.handleAutomaticIntervalChange}/></div>}
                        {this.state.leapHidden && <div><p>Leap Interval (in ms):</p><Input type="text" id="leap" value={this.state.leapInterval} onChange={this.handleLeapIntervalChange}/></div>}
                        <Divider hidden/>
                        <Form.Button type="button" value="Vocabulary" onClick={this.handleChangeDefaultVocabulary}>Change Default Vocabulary</Form.Button>
                        <Form.Input fluid readOnly>
                            {this.state.addVocabulary}
                        </Form.Input>
                        <Divider hidden/>
                        <Form.Button type="submit" value="Submit" onClick={this.saveConfiguration}>Submit</Form.Button>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
    

}

export default ConfigBoardModal;
