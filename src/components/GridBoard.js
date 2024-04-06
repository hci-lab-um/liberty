import React, { Component } from 'react'
import {Grid, GridRow, Transition} from 'semantic-ui-react'
import GridItem from './GridItem'
import {getChosenScanningGesture, getChosenSelectorGesture, changeConfig, getScanningType, getChosenBackScanningGesture, getItemsPerRow, setItemsPerRow, lockSelector, unlockSelector, getRegionScanningColumns, getRegionScanningRows} from '../actions/configactions'
import {handleMouseDown, handleKeyDown} from '../actions/eventsactions'
import * as scanningTypes from '../configuration/scanningtypes'
const {ipcRenderer} = window.require('electron')

class GridBoard extends Component {
    // vocabulary item to be injected when the user is currently scanning inside a folder
    goBackItem = {
        title: "Go Back",
        image: '../images/goback.png',
        function: "goBack",
        children: []
    }

    functionDict = {}

    constructor(props){
        super(props);
        this.state= {
            currentItems: [],
            previousItems: [],
            selectedItemIndex: 0,
            selectedRowIndex: 0,
            selectedColumnIndex: 0,
            initialScannableItemIndex: 0,
            lastScannableItemIndex: 0,
            isSelectingRow: false,
            isSelectingColumn: false,
            isSelectingRegion: false,
            scanningType: scanningTypes.STEP_SCANNING,
            singleRowScanning: false,
            itemsPerRow: 1,
            transitionVisible: false,
            selectedItemActivated: false,
            isGoBackFromRowColumnScanning: false,
            selectableItemsCount: 0,
            scanningRegion: [],
            isDividingHorizontal: true,
            allScanningRegions: [],
            previousScanningRegions: [],
            scanningRegionIndex: 0,
            currentItemInRegionIndex: 0,
            divisionMetaData: {},
            isGoBackFromDivisionScanning: false
        }
        this.handleKeyDownEvent = this.handleKeyDownEvent.bind(this);
        this.handleMouseDownEvent = this.handleMouseDownEvent.bind(this);
        this.loadConfig = this.loadConfig.bind(this);
        this.loadVocabulary = this.loadVocabulary.bind(this);
        this.goBack = this.goBack.bind(this);
        this.getElementsToRender = this.getElementsToRender.bind(this);
        this.chooseScanningType = this.chooseScanningType.bind(this);
        this.checkItemIsSelected = this.checkItemIsSelected.bind(this);
        this.handleScanningTypeChange = this.handleScanningTypeChange.bind(this);

        this.handleScanning = this.handleScanning.bind(this);
        this.handleBackScanning = this.handleBackScanning.bind(this);
        this.handleSelection = this.handleSelection.bind(this);
        this.handleItemScanning = this.handleItemScanning.bind(this);
        this.handleItemBackScanning = this.handleItemBackScanning.bind(this);
        this.handleItemSelection = this.handleItemSelection.bind(this);
        this.handleRowScanning = this.handleRowScanning.bind(this);
        this.handleRowBackScanning = this.handleRowBackScanning.bind(this);
        this.handleRowSelection = this.handleRowSelection.bind(this);
        this.handleColumnScanning = this.handleColumnScanning.bind(this);
        this.handleColumnBackScanning = this.handleColumnBackScanning.bind(this);
        this.handleColumnSelection = this.handleColumnSelection.bind(this);

        this.handleRegionScanning = this.handleRegionScanning.bind(this);
        this.handleRegionBackScanning = this.handleRegionBackScanning.bind(this);
        this.handleRegionSelection = this.handleRegionSelection.bind(this);
        this.handleDivisionScanning = this.handleDivisionScanning.bind(this);
        this.handleDivisionBackScanning = this.handleDivisionBackScanning.bind(this);
        this.handleDivisionSelection = this.handleDivisionSelection.bind(this);
        this.handleGoBackFromColumnRowScanning = this.handleGoBackFromColumnRowScanning.bind(this);
        this.checkIfItemIsActivated = this.checkIfItemIsActivated.bind(this);

        // bind goBack function to "goBack" title in function dictionary
        // if function is not null, then the function defined in the dictionary will be executed
        this.functionDict["goBack"] = this.goBack;
    }

    // Go back from current folder
    goBack = () =>{
        // reset board vocabulary with parent vocabulary
        this.setState({currentItems: this.state.previousItems.pop(), selectedItemIndex: 0, transitionVisible: false, 
            scanningRegionIndex: 0}, () =>{
            // re-set number of items per row
            setItemsPerRow(this.state.currentItems.length, () =>{
                this.setState({itemsPerRow: getItemsPerRow()})
            });
            this.props.onGoBackFromFolder(); // call parent component function to change title
            this.setState({transitionVisible: true}, ()=>{
                setTimeout(()=>{unlockSelector()},1000); // unlock selector after transition finishes
            });
        });
    }

    // handle key press
    handleKeyDownEvent = (event) =>{
        handleKeyDown(event.keyCode);
    } 

    // handle mouse click
    handleMouseDownEvent = (event) =>{
        handleMouseDown(event.which);
    }

    // handle configuration received from main process
    loadConfig = (event, configDetails) =>{
        changeConfig(configDetails);
        // ask main process to send default vocabulary
        ipcRenderer.send('getVocabulary', configDetails.vocabularyFile);
    }

    // handle vocabulary received from main process
    loadVocabulary = (event, vocabulary) =>{
        this.props.onFreshBoard(); // reset title in parent component
        // re-set states to default
        this.setState({currentItems: vocabulary, selectedItemIndex:0, previousItems:[]}, () =>{
            setItemsPerRow(this.state.currentItems.length, () =>{
                this.setState({itemsPerRow: getItemsPerRow(), selectedRowIndex: 0, 
                    selectedColumnIndex: 0, lastScannableItemIndex: 0, initialScannableItemIndex: 0}, ()=>{
                        // re-set scanning type state variables after the other variables have been set
                        this.chooseScanningType(()=>{
                            // set the transition state variable after the scanning type has been set
                            this.setState({transitionVisible:true})
                        });
                    });
            });
            
        });
    }

    // handle the event of the scanning gesture
    handleScanning = (event) =>{
        // check that gestures match
        if(event.detail === getChosenScanningGesture()){
            /* note that the scanning type state is not used since the scanning type can be
               for example row based scanning but the user has already selected the row, so the scannin type
               is still row based scanning, but currently it is step-scanning on the chosen row     */
            if(this.state.isSelectingRow){
                this.handleRowScanning();
            }else if(this.state.isSelectingColumn){
                this.handleColumnScanning();
            }else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING && this.state.selectableItemsCount > 3){
                // division based scanning only when there are more than 3 items
                this.handleDivisionScanning();
            }else if(this.state.isSelectingRegion){
                this.handleRegionScanning();
            }else{
                this.handleItemScanning();
            }
        }
    }

    // handle the event of the back scanning gesture
    handleBackScanning = (event) =>{
        // check that gestures match
        if(event.detail === getChosenBackScanningGesture()){
            // refer to comment in the previous function about why the scanning type state is not used
            if(this.state.isSelectingRow){
                this.handleRowBackScanning();
            }else if(this.state.isSelectingColumn){
                this.handleColumnBackScanning();
            }else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING && this.state.selectableItemsCount > 3){
                this.handleDivisionBackScanning();
            }else if(this.state.isSelectingRegion){
                this.handleRegionBackScanning();
            }else{
                this.handleItemBackScanning();
            }
        }
    }

    // handle the event of the selector gesture
    handleSelection = (event) =>{
        lockSelector(); // lock selection, so that the item is selected only once
        // check that gestures match
        if(event.detail === getChosenSelectorGesture()){
            // refer to comment in the previous function about why the scanning type state is not used
            if(this.state.isSelectingRow){
                this.handleRowSelection();
                setTimeout(()=>{unlockSelector()},500); 
            }else if(this.state.isSelectingColumn){
                this.handleColumnSelection();
                setTimeout(()=>{unlockSelector()},500);
            }else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING && this.state.selectableItemsCount > 3){
                this.handleDivisionSelection(); //note that unlockselector is called within the function since it has to wait for other conditions first
            }else if(this.state.isSelectingRegion){
                this.handleRegionSelection(); //note that unlockselector is called within the function since it has to wait for other conditions first
            }else if(this.state.isGoBackFromRowColumnScanning){
                this.handleGoBackFromColumnRowScanning(); //note that unlockselector is called within the function since it has to wait for other conditions first
            }else{
                this.handleItemSelection(); //note that unlockselector is called within the function since it has to wait for other conditions first
            }
        }
    }

    // scanning next item
    handleItemScanning(){
        // general case - scanning type is step scanning
        if(this.state.scanningType === scanningTypes.STEP_SCANNING){
            if(this.state.selectedItemIndex === this.state.currentItems.length-1)
                this.setState({selectedItemIndex: 0}) // scan first item if no more items proceed
            else
                this.setState({selectedItemIndex: this.state.selectedItemIndex+1}) // scan next item
        }else if(this.state.isGoBackFromRowColumnScanning){
            // case when it is currently in the state of going back from current scanning region
            // scan to the initial scannable index of scanning region
            this.setState({selectedItemIndex: this.state.initialScannableItemIndex, isGoBackFromRowColumnScanning: false, currentItemInRegionIndex: 0})
        }else{ // case of scanning of items but scanning type is not step scanning
            // case of column based scanning and it is not single row
            if(this.state.scanningType === scanningTypes.COLUMN_BASED_SCANNING && !this.state.singleRowScanning){
                if(this.state.selectedItemIndex + this.state.itemsPerRow >= this.state.currentItems.length){
                    if(this.state.currentItems.length <= this.state.itemsPerRow) // case when less items than items per row
                        this.setState({selectedItemIndex: this.state.initialScannableItemIndex}) // go to first scannable item
                    else
                        this.setState({isGoBackFromRowColumnScanning: true}) // select all column for go back from column row scanning
                }else{
                    this.setState({selectedItemIndex: this.state.selectedItemIndex+this.state.itemsPerRow}) // go to next item in column
                }
            }
            // case of row based scanning or any other scanning type but there is only one row
            else if(this.state.scanningType === scanningTypes.ROW_BASED_SCANNING || this.state.singleRowScanning){
                if(this.state.selectedItemIndex === this.state.lastScannableItemIndex){ // if no more next items
                    if(this.state.currentItems.length <= this.state.itemsPerRow) // case when go back from row scanning cannot be done because there is only 1 row
                        this.setState({selectedItemIndex: this.state.initialScannableItemIndex}) // go to first scannable index
                    else
                        this.setState({isGoBackFromRowColumnScanning: true}) // select all row for go back from column row scanning
                }else{
                    this.setState({selectedItemIndex: this.state.selectedItemIndex+1}) // go next item
                }
            }
            // case of region based scanning
            else if(this.state.scanningType === scanningTypes.REGION_BASED_SCANNING)
            {
                let newItemInRegionIndex = this.state.currentItemInRegionIndex + 1;
                if(newItemInRegionIndex >= this.state.scanningRegion.length){
                    // set states to allow for go back from region scanning
                    this.setState({isGoBackFromRowColumnScanning: true, selectedItemIndex: this.state.scanningRegion[0], currentItemInRegionIndex: this.state.scanningRegion[0]});
                }else{
                    // move to next item in region
                    this.setState({selectedItemIndex: this.state.scanningRegion[newItemInRegionIndex], currentItemInRegionIndex: newItemInRegionIndex});
                }                 
            }
            // case of division based scanning
            else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING)
            {
                let newItemInRegionIndex = this.state.currentItemInRegionIndex + 1;
                if(newItemInRegionIndex >= this.state.scanningRegion.length){
                    // set states to allow for go back from division scanning
                    this.setState({isGoBackFromRowColumnScanning: true, selectedItemIndex: this.state.scanningRegion[0], currentItemInRegionIndex: this.state.scanningRegion[0]});
                }else{
                    // move to next item in region
                    this.setState({selectedItemIndex: this.state.scanningRegion[newItemInRegionIndex], currentItemInRegionIndex: newItemInRegionIndex});
                }    
            }
        }
    }

    // scanning previous item
    handleItemBackScanning(){
        // general case - scanning type is step scanning
        if(this.state.scanningType === scanningTypes.STEP_SCANNING){
            if(this.state.selectedItemIndex === 0)
                this.setState({selectedItemIndex: this.state.currentItems.length-1}) // scan last item if no more items preceed
            else
                this.setState({selectedItemIndex: this.state.selectedItemIndex-1}) // scan previous item
        }else if(this.state.isGoBackFromRowColumnScanning){
            // case in go back from row column scanning state
            var currentItemInRegionIndex = 0;
            // set current item in region in case for region based scanning
            if(this.state.scanningRegion.length > 0)
                currentItemInRegionIndex = this.state.scanningRegion.length -1;
            // go to last item    
            this.setState({selectedItemIndex: this.state.lastScannableItemIndex, isGoBackFromRowColumnScanning: false, currentItemInRegionIndex: currentItemInRegionIndex});
        }else{ // case of scanning of items but scanning type is not step scanning
            // case of column based scanning and it is not single row
            if(this.state.scanningType === scanningTypes.COLUMN_BASED_SCANNING && !this.state.singleRowScanning){
                if(this.state.selectedItemIndex - this.state.itemsPerRow < 0)
                    this.setState({isGoBackFromRowColumnScanning: true}) // allow for go back from column scanning
                else
                    this.setState({selectedItemIndex: this.state.selectedItemIndex-this.state.itemsPerRow}) // go to previous item in column region
            }
            // case of row based scanning or single row scanning
            else if(this.state.scanningType === scanningTypes.ROW_BASED_SCANNING || this.state.singleRowScanning){
                if(this.state.selectedItemIndex === this.state.initialScannableItemIndex)
                    this.setState({isGoBackFromRowColumnScanning: true}) // allow for go back from row scanning
                else
                    this.setState({selectedItemIndex: this.state.selectedItemIndex-1}) // go to previous item
            }
            // case of region based scanning
            else if(this.state.scanningType === scanningTypes.REGION_BASED_SCANNING)
            {
                let newItemInRegionIndex = this.state.currentItemInRegionIndex - 1;
                if(newItemInRegionIndex < 0){ // no more items to go back to in region
                    this.setState({isGoBackFromRowColumnScanning: true}); // select all region to allow for go back from region
                }else{
                    // go to previous item in region
                    this.setState({selectedItemIndex: this.state.scanningRegion[newItemInRegionIndex], currentItemInRegionIndex: newItemInRegionIndex});
                }        
            }
            // case of division based scanning
            else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING)
            {
                let newItemInRegionIndex = this.state.currentItemInRegionIndex - 1;
                if(newItemInRegionIndex < 0){ // no more items to go back to in region
                    this.setState({isGoBackFromRowColumnScanning: true}); // select all division to allow for go back from current division
                }else{
                    // go to previous item in division
                    this.setState({selectedItemIndex: this.state.scanningRegion[newItemInRegionIndex], currentItemInRegionIndex: newItemInRegionIndex});
                }   
            }
        }
    }

    // selection of item in step-scanning
    handleItemSelection(){
        let selectedItem = this.state.currentItems[this.state.selectedItemIndex];
            if(selectedItem.children.length !== 0){
                // case for folder item
                this.setState({transitionVisible: false});
                // identify new vocabulary items
                var newItems =[];
                // avoid list of objects being addressed as reference
                newItems = JSON.parse(JSON.stringify(selectedItem.children));
                newItems.push(this.goBackItem);
                // set state of current vocabulary and list of lists of previous vocabularies to go back to
                this.setState({previousItems: [...this.state.previousItems, this.state.currentItems], currentItems: newItems, selectedItemIndex: 0, scanningRegionIndex: 0, previousScanningRegions: [], allScanningRegions:[]}, () => {
                    setItemsPerRow(this.state.currentItems.length, () =>{
                        this.setState({itemsPerRow: getItemsPerRow()}, ()=>{
                            // refrest state variables according to scanning type only after the items per row have been identified
                            this.chooseScanningType();
                        });  
                    });              
                    this.props.onGoToSubFolder(selectedItem.title); // call parent fucntion so that the title is changed
                    // perform the transition to a sub folder
                    this.setState({transitionVisible: true}, ()=>{
                        setTimeout(()=>{
                            unlockSelector(); // unlock the selector after the transition was performed
                        },1000);
                    });
                });
            }else if(selectedItem.function !== null){
                // case when function is not null
                // currently only used for go back function
                this.functionDict[selectedItem.function](); // get function definition from function dictionary
                this.chooseScanningType(); // refresh the state variables for the chosen scanning type
            }else{
                // activate item to do transition
                this.setState({selectedItemActivated: true}, ()=>{                      
                    var msg = new SpeechSynthesisUtterance(selectedItem.title);
                    window.speechSynthesis.speak(msg); // speak the title of the item
                    
                    setTimeout(()=>{
                        this.setState({selectedItemActivated: false}, ()=>{
                            // use of timeouts to allow the transition and voice output of title to finish
                            setTimeout(()=> {
                                this.chooseScanningType(); // refresh the state variables for the chosen scanning type
                            },500);
                            setTimeout(()=> {
                                unlockSelector(); // unlock scanning only after a second after the transition has elapsed
                            },1000);
                        });
                    }, 500);

                });
                
            }
    }

    // scan next row
    handleRowScanning(){
        var totalRows = Math.ceil(this.state.currentItems.length / this.state.itemsPerRow);
        if(this.state.selectedRowIndex === totalRows-1)
            this.setState({selectedRowIndex: 0}) // go to first row if no more next rows
        else
            this.setState({selectedRowIndex: this.state.selectedRowIndex+1}) // go to next row
    }

    // scan previous row
    handleRowBackScanning(){
        var totalRows = Math.ceil(this.state.currentItems.length / this.state.itemsPerRow);
        if(this.state.selectedRowIndex === 0)
            this.setState({selectedRowIndex: totalRows-1}) // go to last row if no more previous rows
        else
            this.setState({selectedRowIndex: this.state.selectedRowIndex-1}) // go to previous row
    }

    // select row
    handleRowSelection(){
        var currentRow = this.state.selectedRowIndex;
        let initialIndex = currentRow * this.state.itemsPerRow;
        let lastIndex = ((currentRow + 1) * this.state.itemsPerRow)-1;
        // identify last index of row
        while(lastIndex !== 0){
            if(lastIndex >= this.state.currentItems.length)
                lastIndex--;
            else
                break;
        }
        // assign row region on which step scanning is to be performed
        this.setState({isSelectingRow: false, initialScannableItemIndex: initialIndex, 
            lastScannableItemIndex: lastIndex, selectedItemIndex: initialIndex});
    }

    handleColumnScanning(){
        if(this.state.selectedColumnIndex === this.state.itemsPerRow-1)
            this.setState({selectedColumnIndex: 0}) // go to first column if no more next columns
        else
            this.setState({selectedColumnIndex: this.state.selectedColumnIndex+1}) // go to next columns
    }

    // scan previous column
    handleColumnBackScanning(){
        if(this.state.selectedColumnIndex === 0)
            this.setState({selectedColumnIndex: this.state.itemsPerRow-1}) // go to last column if no previous columns
        else
            this.setState({selectedColumnIndex: this.state.selectedColumnIndex-1}) // go to previous column
    }

    // select column
    handleColumnSelection(){
        var currentColumnIndex = this.state.selectedColumnIndex;
        var totalRows = Math.ceil(this.state.currentItems.length / this.state.itemsPerRow);
        let initialIndex = currentColumnIndex;
        let lastRowIndex = totalRows - 1;
        let lastIndex = (lastRowIndex*this.state.itemsPerRow) + currentColumnIndex;
        // identify the column region on which step scanning is to be performed
        this.setState({isSelectingColumn: false, initialScannableItemIndex: initialIndex, 
            lastScannableItemIndex: lastIndex, selectedItemIndex: initialIndex});
    }

    // scan next region
    handleRegionScanning(){
        let selectedRegionIndex = this.state.scanningRegionIndex;
        let allScanningRegions = this.state.allScanningRegions;
        if(selectedRegionIndex  < allScanningRegions.length - 1)
        {
            // go to next region
            this.setState({scanningRegionIndex: selectedRegionIndex + 1, scanningRegion: allScanningRegions[selectedRegionIndex +1]});
        }else{
            // go to first region if no more subsequent regions
            this.setState({scanningRegionIndex: 0}, ()=>{
                this.setState({scanningRegion: allScanningRegions[0]});
            });
        }
       
    }

    // scan previous region
    handleRegionBackScanning(){
        let selectedRegionIndex = this.state.scanningRegionIndex;
        let allScanningRegions = this.state.allScanningRegions;
        if(selectedRegionIndex -1 >= 0)
        {
            // go to previous region
            this.setState({scanningRegionIndex: selectedRegionIndex - 1, scanningRegion: allScanningRegions[selectedRegionIndex -1]});
        }else{
            // go to last region in case no more previous regions
            this.setState({scanningRegionIndex: allScanningRegions.length-1}, ()=>{
                this.setState({scanningRegion: allScanningRegions[this.state.scanningRegionIndex]});
            });
        }
    }

    // select region
    handleRegionSelection(){
        let selectedRegion = this.state.scanningRegion;
        // set state variables to indicate the region on which step scanning can now be performed
        this.setState({isSelectingRegion: false, selectedItemIndex: selectedRegion[0], initialScannableItemIndex: selectedRegion[0], 
            lastScannableItemIndex: selectedRegion[selectedRegion.length - 1], currentItemInRegionIndex: 0}, ()=>{
            unlockSelector();
        });
    }


    // scan next division in division based scanning
    handleDivisionScanning(){
        let selectedRegionIndex = this.state.scanningRegionIndex;
        let allScanningRegions = this.state.allScanningRegions;
        // go to the first region of division if in the state of go back from current divisions (i.e. all divisions are highlighted)
        if(this.state.isGoBackFromDivisionScanning){
            this.setState({scanningRegionIndex: 0, isGoBackFromDivisionScanning: false}, ()=>{
                this.setState({scanningRegion: allScanningRegions[0]});
            });
        }else{
            if(selectedRegionIndex  < allScanningRegions.length - 1)
            {
                // go to next region
                this.setState({scanningRegionIndex: selectedRegionIndex + 1, scanningRegion: allScanningRegions[selectedRegionIndex +1]});
            }else{
                // if there are division regins to go back to
                if(this.state.previousScanningRegions.length > 0){
                    this.setState({isGoBackFromDivisionScanning: true, scanningRegion: allScanningRegions[0]});
                }else{
                    // else go to first region
                    this.setState({scanningRegionIndex: 0}, ()=>{
                        this.setState({scanningRegion: allScanningRegions[0]});
                    });
                }
            }
        }
    }

    // scan back in division based scanning
    handleDivisionBackScanning(){
        let selectedRegionIndex = this.state.scanningRegionIndex;
        let allScanningRegions = this.state.allScanningRegions;
        
        // if the user is in the state to go back from current division, go to the last division
        if(this.state.isGoBackFromDivisionScanning){
            this.setState({scanningRegionIndex: allScanningRegions.length-1, isGoBackFromDivisionScanning: false}, ()=>{
                this.setState({scanningRegion: allScanningRegions[this.state.scanningRegionIndex]});
            });
        }else{
            if(selectedRegionIndex -1 >= 0)
            {
                this.setState({scanningRegionIndex: selectedRegionIndex - 1, scanningRegion: allScanningRegions[selectedRegionIndex -1]});
            }else{
                // case when there are no more divisions to the left, so both the division regions are selected so that the user can go back from that divison set
                if(this.state.previousScanningRegions.length > 0){ // check if there are division regions to go back to
                    this.setState({isGoBackFromDivisionScanning: true});
                }else{
                    // move to the last division if go back from current division scanning cannot be performed
                    this.setState({scanningRegionIndex: allScanningRegions.length-1}, ()=>{
                        this.setState({scanningRegion: allScanningRegions[this.state.scanningRegionIndex]});
                    });
                }
            }
        }
        
    }

    // case when user selects division
    handleDivisionSelection(){
        if(this.state.isGoBackFromDivisionScanning){
            // go back from current division
            this.handleGoBackFromDivisionScanning(unlockSelector);
        }else{
            // enter the division
            // assign the meta data of the scanning region on which to base the division
            let divisionMetaData = {};
            divisionMetaData.initialColumnIndex = this.getColumnIndex(this.state.scanningRegion[0]);
            divisionMetaData.initialRowIndex = this.getRowIndex(this.state.scanningRegion[0]);
            divisionMetaData.maximumColumnIndex = this.getMaximumColumnIndex();
            divisionMetaData.maximumRowIndex = this.getRowIndex(this.state.scanningRegion[this.state.scanningRegion.length -1]);
            this.setState({divisionMetaData: divisionMetaData}, () =>{
                this.createDivisionRegions(unlockSelector);
            });
        }    
    }

    // function used to go back from the current scanning area
    handleGoBackFromColumnRowScanning(){
        this.setState({isGoBackFromRowColumnScanning: false}, ()=>{
            switch(this.state.scanningType){
                // go back from current row
                case scanningTypes.ROW_BASED_SCANNING:
                this.setState({isSelectingRow: true}, ()=>{
                    this.handleRowScanning();
                    unlockSelector();
                });
                break;
                // go back from current column
                case scanningTypes.COLUMN_BASED_SCANNING:
                this.setState({isSelectingColumn: true}, ()=>{
                    this.handleColumnScanning();
                    unlockSelector();
                });
                break;
                // go back from current region
                case scanningTypes.REGION_BASED_SCANNING:
                this.setState({isSelectingRegion: true}, ()=>{
                    this.handleRegionScanning();
                    unlockSelector();
                });
                break;
                // go back from current division
                // in here it is the case when the user arrived at the stage when there are no more divisions, so he can actually select the item
                case scanningTypes.DIVISION_BASED_SCANNING:
                this.handleGoBackFromDivisionScanning(unlockSelector);
                break;
            }
        })
    }

    // used when the scanning type is division based scanning, and the user wishes to go back to the previous divisions
    handleGoBackFromDivisionScanning(callback =()=>{}){
        if(this.state.previousScanningRegions.length > 0){
            let previousScanningRegions = this.state.previousScanningRegions;
            let allScanningRegions = previousScanningRegions.pop(); // setting the scanning regions to be scanned next to the previous scanning regions
            this.setState({allScanningRegions: allScanningRegions, isDividingHorizontal: !this.state.isDividingHorizontal, isGoBackFromDivisionScanning: false, previousScanningRegions: previousScanningRegions}, ()=>{
                let selectableItemsCount = this.state.allScanningRegions[0].length + this.state.allScanningRegions[1].length;
                let index = 0;
                /* condition below used to indicate to te user that the go back operation was performed
                   automatically going to the next division */
                if(this.state.allScanningRegions[0][0] === this.state.scanningRegion[0])
                    index = 1;
                else
                    index = 0;
                this.setState({selectableItemsCount: selectableItemsCount, scanningRegion: allScanningRegions[index], scanningRegionIndex: index })
                callback(); // callback to unlock the selector
            });
        }
    }

    // helper funciton to get index of current row from selected item index
    getCurrentRowIndex(){
        let itemIndex = this.state.selectedItemIndex;
        let rowIndex = Math.trunc(itemIndex/this.state.itemsPerRow);
        return rowIndex;
    }

    // helper function to get index of current column from the selected item index
    getCurrentColumnIndex(){
        let itemIndex = this.state.selectedItemIndex;
        let itemIndexesPerRow = this.state.itemsPerRow -1; 
        while(itemIndex > itemIndexesPerRow){
            itemIndex = itemIndex - this.state.itemsPerRow;
        }
        return itemIndex;
    }

    // helper function to get the first index of the current region
    getInitialRegionItemIndex()
    {
        const {initialScannableColumnIndex, initialScannableRowIndex} = this.state.scanningRegion;
        return initialScannableColumnIndex + (this.state.itemsPerRow * initialScannableRowIndex);
    }

    // helper function to get the item index given the row and column indexes
    getItemIndex(rowIndex, columnIndex){
        return columnIndex + (this.state.itemsPerRow * rowIndex);
    }

    // helper function to get the row index given the item index
    getRowIndex(itemIndex){
        return Math.trunc(itemIndex / this.state.itemsPerRow);
    }

    // helper function to get column index given the item index
    getColumnIndex(itemIndex){
        let itemIndexesPerRow = this.state.itemsPerRow -1; 
        while(itemIndex > itemIndexesPerRow){
            itemIndex = itemIndex - this.state.itemsPerRow;
        }
        return itemIndex;
    }

    // helper function to get the maximum column index of scanning region
    getMaximumColumnIndex(){
        let scanningRegion = this.state.scanningRegion;
        let initialRowIndex = this.getRowIndex(scanningRegion[0]);
        let rowIndex = initialRowIndex;
        let scanningRegionIndex = 0;
        let columnIndex = 0;
        while(rowIndex === initialRowIndex){
            if(scanningRegionIndex >= scanningRegion.length)
            break;
            columnIndex = this.getColumnIndex(scanningRegion[scanningRegionIndex]);
            scanningRegionIndex++;
            rowIndex = this.getRowIndex(scanningRegion[scanningRegionIndex]);
        }

        return columnIndex;
    }

    // helper function to get the maximum columns per row
    getMaxColumnsPerRow(initialRowIndex, lastRowIndex)
    {
        let itemsPerRow = this.state.itemsPerRow;
        let maxCount = this.state.currentItems.length;
        if(initialRowIndex == 0){
            return itemsPerRow;
        }
        else if((lastRowIndex+1)*itemsPerRow > maxCount ){
            return itemsPerRow - (itemsPerRow*(lastRowIndex+1) - maxCount);
        }else{
            return itemsPerRow;
        }
    }

    // event when the user changes the scanning type from the configurations menu
    handleScanningTypeChange = (event)=>{
        this.chooseScanningType();
    }

    // function to set the state variables according to scanning type
    // callback function is called once to apply the transition after the vocabulary loads
    chooseScanningType(callback = ()=>{}){
        let scanningType = getScanningType();
        if(scanningType === scanningTypes.ROW_BASED_SCANNING){
           // condition for roe based scanning
            this.setState({selectedRowIndex: 0, isSelectingColumn: false, isSelectingRegion: false, scanningType: scanningType}, () =>{
                if(this.state.currentItems.length <= this.state.itemsPerRow) // case where only one row
                    // below state variables are set so that the user would not need to select the row since there is only one row
                    this.setState({isSelectingRow: false, initialScannableItemIndex:0, lastScannableItemIndex: this.state.currentItems.length-1}, ()=>{
                        callback();
                    });
                else
                    this.setState({isSelectingRow: true}, ()=> {
                        callback();
                    });
            });

        }else if(scanningType === scanningTypes.COLUMN_BASED_SCANNING){
            // condition for column based scanning
            this.setState({selectedColumnIndex: 0, isSelectingRow: false, isSelectingRegion: false, scanningType: scanningType}, () =>{
                if(this.state.currentItems.length <= this.state.itemsPerRow) // case when there is only one row
                    // below state variables are set so that the user would not need to do the select gesture twice to select the item
                    this.setState({isSelectingColumn: false,initialScannableItemIndex:0, lastScannableItemIndex: this.state.currentItems.length-1, singleRowScanning: true}, ()=>{
                        callback();
                    });
                else
                    this.setState({isSelectingColumn: true, singleRowScanning: false}, ()=>{
                        callback();
                    });
            });
        }else if(scanningType === scanningTypes.DIVISION_BASED_SCANNING){
            // division based scanning
            let itemsPerRow = this.state.itemsPerRow;
            let itemsCount = this.state.currentItems.length;
            if(itemsCount < itemsPerRow)
                itemsPerRow = itemsCount;
            
            let maximumColumnIndex = itemsPerRow - 1;
            let maximumRowIndex = Math.floor(itemsCount / itemsPerRow);
            // construct the first division metdata object which is used to define the region on which division is to be done
            let divisionMetaData = {};
            divisionMetaData.initialColumnIndex = 0;
            divisionMetaData.initialRowIndex = 0;
            divisionMetaData.maximumColumnIndex = maximumColumnIndex;
            divisionMetaData.maximumRowIndex = maximumRowIndex;
            // initial scanning region would be all indexes
            let initialScanningRegion = [];
            for (var index = 0; index <= this.state.currentItems.length; index++) {
                initialScanningRegion.push(index);
            }
            // set the required state variables and call function to create division regions
            this.setState({scanningType: scanningType, selectedRowIndex: 0, selectedColumnIndex: 0, 
                isSelectingRow: false, isSelectingColumn: false, isSelectingRegion: false, scanningRegionIndex: 0, 
                isDividingHorizontal: true, divisionMetaData: divisionMetaData, scanningRegion: initialScanningRegion, previousScanningRegions: [], allScanningRegions: [] }, () => {
                this.createDivisionRegions(callback);
            });
        }else if(scanningType === scanningTypes.REGION_BASED_SCANNING){
            // region based scanning
            this.setState({scanningType: scanningType, selectedRowIndex: 0, selectedColumnIndex: 0, isSelectingRow: false, isSelectingColumn: false, isSelectingRegion: true, scanningRegionIndex: 0, previousScanningRegions: []}, () => {
                // call function to create scanning regions
                this.createScanningRegions(callback);
            });
        }else{
            // STEP-SCANNING if other conditions are false
            this.setState({scanningType: scanningType, isSelectingColumn: false, isSelectingRow: false}, ()=>{
                callback();
            });
        }
    }

    // create scanning regions in case of region based scanning
    createScanningRegions(callback = ()=>{}){
        let regionScanningColumnsInterval = getRegionScanningColumns();
        let regionScanningRowsInterval = getRegionScanningRows();
        let itemsPerRow = this.state.itemsPerRow;
        let itemsCount = this.state.currentItems.length;
        if(itemsCount < itemsPerRow)
            itemsPerRow = itemsCount;
        
        let maximumColumnIndex = itemsPerRow - 1;
        let maximumRowIndex = Math.floor(itemsCount / itemsPerRow);
        let allScanningRegions = [];
        let initialColumnIndex = 0;
        let initialRowIndex = 0;
        let maxItemsPerRegion = regionScanningColumnsInterval * regionScanningRowsInterval;
        let maxLoops =0;
        while(maxLoops < 100){ // need to loop until all regions have been assigned, hypothetically there will never be more than 100 regions
            maxLoops++;
            let newRegion = [];
            let currentColumnIndex = initialColumnIndex;
            let currentRowIndex = initialRowIndex;
            let loopCount = 0;
            // loop to assign items to next region
            while(loopCount < maxItemsPerRegion)
            {
                // depends on whether the item index lies in the possible row/column index
                let itemIndex = this.getItemIndex(currentRowIndex, currentColumnIndex);
                if(itemIndex < itemsCount) // in case the index returned overflows the total items
                    newRegion.push(itemIndex);
                currentRowIndex++;
                if(currentRowIndex >= (initialRowIndex + regionScanningRowsInterval)){
                    currentRowIndex = initialRowIndex;
                    currentColumnIndex++;
                    if(currentColumnIndex > maximumColumnIndex)
                    break;
                }
                loopCount++;
            }
            // if region is not empty add it to all regions
            if(newRegion.length !== 0)
                allScanningRegions.push(newRegion);
            initialColumnIndex = initialColumnIndex + regionScanningColumnsInterval;
            if(initialColumnIndex > maximumColumnIndex){
                initialColumnIndex = 0;
                initialRowIndex = initialRowIndex + regionScanningRowsInterval;
                // if there are no more rows and columns to scan through for item indexes
                if(initialRowIndex > maximumRowIndex){
                    break; // break loop when all regions have been assigned
                }
            }
        }
           
        this.setState({allScanningRegions: allScanningRegions, scanningRegion: allScanningRegions[0]}, ()=>{
            callback(); //callback functionally would usually be called to apply the transition
        });      
    }

    // function used to create the division regions in case of division based scanning
    createDivisionRegions(callback = ()=>{}){
        let selectableItemsCount = this.state.scanningRegion.length;
        let previousScanningRegions = this.state.allScanningRegions;
        // if the scannable items in the regions are more than 3
        if(selectableItemsCount > 3){
            let divisionMetaData = this.state.divisionMetaData;
            // get whole scannable region indexes
            const {initialColumnIndex, initialRowIndex, maximumColumnIndex, maximumRowIndex} = divisionMetaData;
            let itemsCount = this.state.currentItems.length;
            let halfColumn = Math.ceil((maximumColumnIndex + initialColumnIndex) / 2);
            let halfRow = Math.ceil((maximumRowIndex + initialRowIndex) / 2);
            let allScanningRegions = [];
            // depending whether next division is horizontal or vertical
            if(this.state.isDividingHorizontal){
                // split indexes into left and right scannable regions
                let leftScanningRegion = [];
                let rightScanningRegion = [];
                for(let row=initialRowIndex; row <= maximumRowIndex; row++){
                    for(let column =initialColumnIndex; column <= maximumColumnIndex; column++ ){
                        let itemIndex = this.getItemIndex(row, column);
                        if(itemIndex < itemsCount){
                            if(column < halfColumn){
                                leftScanningRegion.push(itemIndex);
                            }else{
                                rightScanningRegion.push(itemIndex);
                            }
                        }
                    }
                }
                // push left and right regions to all scannable regions
                allScanningRegions.push(leftScanningRegion);
                allScanningRegions.push(rightScanningRegion);
            }else{
                // split indexes into top and bottom scannable regions
                let topScanningRegion = [];
                let bottomScanningRegion = [];
                for(let row=initialRowIndex; row <= maximumRowIndex; row++){
                    for(let column =initialColumnIndex; column <= maximumColumnIndex; column++ ){
                        let itemIndex = this.getItemIndex(row, column);
                        if(itemIndex < itemsCount){
                            if(row < halfRow){
                                topScanningRegion.push(itemIndex);
                            }else{
                                bottomScanningRegion.push(itemIndex);
                            }
                        }
                    }
                }
                // push top and bottom regions to all scannable regions
                allScanningRegions.push(topScanningRegion);
                allScanningRegions.push(bottomScanningRegion);
            }
            // set the state variables with the required values
            this.setState({allScanningRegions: allScanningRegions, scanningRegion: allScanningRegions[0], 
                isDividingHorizontal: !this.state.isDividingHorizontal, scanningRegionIndex: 0}, ()=>{
                this.setState({selectableItemsCount: selectableItemsCount});
                if(previousScanningRegions.length > 0)
                this.setState({previousScanningRegions: [...this.state.previousScanningRegions, previousScanningRegions]});
                callback();
            });    
        }else{
            // no more divisions can be done, switching to step scanning on selected division
            this.setState({selectableItemsCount: selectableItemsCount});
            let selectedRegion = this.state.scanningRegion;
            this.setState({selectedItemIndex: selectedRegion[0], initialScannableItemIndex: selectedRegion[0], 
                lastScannableItemIndex: selectedRegion[selectedRegion.length - 1], currentItemInRegionIndex: 0}, ()=>{
                    this.setState({previousScanningRegions: [...this.state.previousScanningRegions, previousScanningRegions]});
                    callback();
                });          
        }       
    }

    // function to check if the item at given index is being scanned so that it can be highlighted
    checkItemIsSelected(rowIndex, columnIndex, itemIndex){
        // whether the item is one of the selected ones depends on the scanning type
        if(this.state.isSelectingRow || (this.state.scanningType === scanningTypes.ROW_BASED_SCANNING && this.state.isGoBackFromRowColumnScanning)){
            if(rowIndex === this.state.selectedRowIndex)
            return true;
        }else if(this.state.isSelectingColumn|| (this.state.scanningType === scanningTypes.COLUMN_BASED_SCANNING && this.state.isGoBackFromRowColumnScanning)){
            if(columnIndex === this.state.selectedColumnIndex)
            return true;
        }else if(this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING && this.state.selectableItemsCount > 3){
          if(this.state.isGoBackFromDivisionScanning){
            if(this.state.allScanningRegions[0].includes(itemIndex) || this.state.allScanningRegions[1].includes(itemIndex))
            return true;
          }else{
            if(this.state.scanningRegion.includes(itemIndex))
            return true;
          }
        }else if(this.state.isSelectingRegion || (this.state.isGoBackFromRowColumnScanning && (this.state.scanningType === scanningTypes.DIVISION_BASED_SCANNING || this.state.scanningType === scanningTypes.REGION_BASED_SCANNING))){
          if(this.state.scanningRegion.includes(itemIndex))
          return true;
        }else{
            if(itemIndex === this.state.selectedItemIndex)
            return true;
        }
        return false;
    }

    // function to check whether the item is selected by the user
    checkIfItemIsActivated(itemIndex){
        if(this.state.selectedItemActivated && itemIndex == this.state.selectedItemIndex)
            return true;
        else 
            return false;
    }

    // function to construct the elements to render in the grid
    getElementsToRender(){
        let itemsPerRow = this.state.itemsPerRow; // get maximum items per row
        var rows = [];
        var totalRows = Math.ceil(this.state.currentItems.length / itemsPerRow); // get maximum number of rows
        // identify the items per row
        for(var i=0; i<totalRows; i++){
            let newRow = [];
            let itemCounter = i * itemsPerRow;
            while(itemCounter < (i+1) * itemsPerRow){
                if(this.state.currentItems.length <= itemCounter)
                    break;
                newRow.push(this.state.currentItems[itemCounter]);
                itemCounter++;
            }
            rows.push(newRow);
        }

        // map through all rows
        let elementsToRender = rows.map((row, rowIndex) => 
        <GridRow key={rowIndex}>
            {   // map through all elements in row
                row.map((item, columnIndex) =>{
                let itemIndex = columnIndex + (rowIndex*itemsPerRow);
                let itemIsSelected = this.checkItemIsSelected(rowIndex, columnIndex, itemIndex); // if item is being scanned
                let itemIsActivated = this.checkIfItemIsActivated(itemIndex); // if user selects item
                let isParent = item.children.length > 0;
                return <GridItem height={this.props.height/4} item={item} key={columnIndex} id={itemIndex} 
                         selected={itemIsSelected} itemActivated={itemIsActivated} isParent={isParent} />
            })}
        </GridRow>
        );
        return elementsToRender;
    }

    componentDidMount(){
        // add event listeners
        document.addEventListener('mousedown', this.handleMouseDownEvent);
        document.addEventListener('keydown', this.handleKeyDownEvent);
        document.addEventListener('scanning', this.handleScanning);
        document.addEventListener('backScanning', this.handleBackScanning);
        document.addEventListener('selection', this.handleSelection);
        document.addEventListener('scanningTypeChanged', this.handleScanningTypeChange);
        
        // ask main process to send configuration
        ipcRenderer.send('getConfiguration');

        // add event listeners for main process messages
        ipcRenderer.on('configLoad', this.loadConfig);
        ipcRenderer.on('vocabularyLoad', this.loadVocabulary);
    }

    componentWillUnmount(){
        // remove listeners on component unmount
        ipcRenderer.removeListener('configLoad', this.loadConfig);
        ipcRenderer.removeListener('vocabularyLoad', this.loadVocabulary);
    }
   
    // render the grid of vocabulary items with a transition wrapper
  render() {
    let elementsToRender = this.getElementsToRender();
    let visible = this.state.transitionVisible;
    let hide= 0;
    let show = 1000;
    return (
        <Transition animation='fade down' duration={{hide,show}} visible={visible}>
            <Grid columns={this.state.itemsPerRow} container={false} celled='internally'>
            {elementsToRender}
            </Grid>
        </Transition>
    );
  }
}

export default GridBoard;
