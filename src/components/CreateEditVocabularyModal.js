import React, { Component } from 'react'
import { Modal, Button, Divider, Transition } from 'semantic-ui-react';
import VocabularyGrid from './VocabularyGrid';
import AddEditItemModal from './AddEditItemModal';
const {ipcRenderer} = window.require('electron')

export default class CreateEditVocabularyModal extends Component {
    constructor(props){
        super(props);
        this.state = {
            createEditVocabularyModalOpen: false,
            goBackDisabled: true,
            saveButtonDisabled: true,
            currentItems: [],
            previousItems: [],
            parentIndexList: [],
            selectedItemIndex: 0,
            itemSelected: false,
            addItemDisabled: true,
            currentTitle: "Create New Board",
            previousTitles: [],
            editMode: false,
            itemModalOpen: false,
        }
        this.closeCreateEditVocabularyModal = this.closeCreateEditVocabularyModal.bind(this);
        this.addNewItem = this.addNewItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.selectItem = this.selectItem.bind(this);
        this.viewChildren = this.viewChildren.bind(this);
        this.goBack = this.goBack.bind(this);
        this.saveBoard = this.saveBoard.bind(this);

        this.removeItem = this.removeItem.bind(this);
        this.boardSaved = this.boardSaved.bind(this);

        this.openAddEditItemModal = this.openAddEditItemModal.bind(this);
        this.closeAddEditItemModal = this.closeAddEditItemModal.bind(this);

    }

    closeCreateEditVocabularyModal(){
        // on close modal
        this.setState({createEd: false, itemSelected: false});
        this.props.onClose();
    }

    addNewItem(itemName, itemFunction, itemImage){
        // adding new item to the vocabulary

        let newItem ={
            title: itemName,
            function: itemFunction === "" ? null: itemFunction ,
            children: [],
            image: itemImage
        }

        this.setState({currentItems: [...this.state.currentItems, newItem], itemModalOpen: false}, () =>{
                if(this.state.previousItems.length === 0)
                    this.setState({saveButtonDisabled: false}); //enable save button
            });
    }

    editItem(itemName, itemFunction, itemImage){
        // editing an item in the vocabulary
        const currentItems = [...this.state.currentItems];
        var selectedItem = currentItems[this.state.selectedItemIndex];
        let editedItem = {
            title: itemName,
            function: itemFunction === "" ? null: itemFunction ,
            children: selectedItem.children,
            image: itemImage
        }
        currentItems[this.state.selectedItemIndex] = editedItem;
        this.setState({currentItems: currentItems, itemModalOpen: false, editMode: false});
    }

    selectItem(index){
        // function called when an item is selected/clicked
        this.setState({selectedItemIndex: index, itemSelected: true});
    }

    viewChildren(){
        // view the children of the vocabulary item
        let newIndex = this.state.selectedItemIndex;
        let selectedItem = this.state.currentItems[newIndex];
        var newItems =[];
        // avoid list of objects being addressed as reference
        newItems = JSON.parse(JSON.stringify(selectedItem.children));
        // need to save the previous vocabulary items and the new vocabulary items to be displayed on grid
        this.setState({previousItems: [...this.state.previousItems, this.state.currentItems], currentItems: newItems,
            parentIndexList: [...this.state.parentIndexList, newIndex], currentTitle: selectedItem.title, previousTitles: [...this.state.previousTitles, this.state.currentTitle]},()=>{
            this.setState({saveButtonDisabled: true, goBackDisabled: false,selectedItemIndex: 0, itemSelected: false});
        });
    }

    removeItem(){
        // removal of item from the current vocabulary
        this.setState({currentItems: this.state.currentItems.slice(0,this.state.selectedItemIndex).concat(this.state.currentItems.slice(this.state.selectedItemIndex + 1,this.state.currentItems.length)),
        itemSelected: false});
    }

    modifyItem(){
        // function called when modify button is pressed
        this.setState({editMode : true, itemModalOpen: true});
    }

    goBack(){
        // go back from current vocabulary to previous vocabulary (in case you are in a folder)
        let parentIndex = this.state.parentIndexList.pop();
        let previousItems = this.state.previousItems;
        let pastPreviousItems = previousItems.pop();
        pastPreviousItems[parentIndex].children = this.state.currentItems;
        this.setState({currentItems: pastPreviousItems, previousItems: previousItems, currentTitle: this.state.previousTitles.pop()}, () =>{
           // Note that one must be at the root vocabulary to be able to save it. This is a limitation of this feature
            if(this.state.previousItems.length === 0)
                this.setState({goBackDisabled: true, saveButtonDisabled: false, itemSelected: false});
            else
                this.setState({itemSelected: false});
        })  
    }

    saveBoard(){
        // send vocabulary to be saved to the main process
        ipcRenderer.send('newBoard', this.state.currentItems);
    }

    boardSaved = (event) =>{
        // gracefully handle closing on modal window on board saved
        this.setState({CreateEditVocabularyModalOpen: false, saveButtonDisabled: true,
            currentItems:[], previousItems: [], parentIndexList:[], selectedItemIndex: 0, itemSelected: false});
        this.props.onClose();
    }

    setEditStates(props = this.props){
        // set the required state variables depending on whether a new vocabulary is being added or an existing vocabulary is being edited
        if(!props.editMode){
            this.setState({CreateEditVocabularyModalOpen: props.open ,currentItems : [] , currentTitle : 'Create New Board'});
        }else{
            this.setState({CreateEditVocabularyModalOpen: props.open, currentTitle : 'Edit Existing Board', saveButtonDisabled: false}, ()=>{
                this.setState({currentItems: props.vocabularyToEdit});
            });
        }
    }


    openAddEditItemModal(){
        // open addedititemmodal
        this.setState({editMode: false, itemSelected: false}, ()=>{
            this.setState({itemModalOpen: true});
        });
    }

    closeAddEditItemModal(){
        // closing addedititemmodal
        this.setState({itemModalOpen: false, editMode: false});
    }

    renderItemModal(){
        // render add/edit item modal
        // Modal properties will vary whether on whether the new item is being added or an item is being edited
        if(this.state.editMode){
            var selectedItem = this.state.currentItems[this.state.selectedItemIndex];
            return(<AddEditItemModal onButtonClick = {this.editItem} onCloseAddItemModal={this.closeAddEditItemModal} open={this.state.itemModalOpen} editMode = {this.state.editMode} selectedItem= {selectedItem}/>);
    
        }else{
            return(<AddEditItemModal onButtonClick = {this.addNewItem} onCloseAddItemModal={this.closeAddEditItemModal} open={this.state.itemModalOpen} editMode = {this.state.editMode}/>);
        }
    }

    componentDidMount(){
        // listen to event from main process of board saved
        ipcRenderer.on('boardSaved', this.boardSaved);
         // call function to assign state variables depending on props
        this.setEditStates();
    }

    componentWillUnmount(){
        // remove event listener
        ipcRenderer.removeListener('boardSaved', this.boardSaved);
    }

    componentWillReceiveProps(nextProps){
        // call function to assign state variables depending on props
        this.setEditStates(nextProps);
    }
    
    render() {
        const renderModal = this.renderItemModal();
        const { currentItems, parentIndexList } = this.state;
        //max length for sub folders
        var showAddButton = currentItems.length < 27;
        if (parentIndexList.length === 0) {
            //max length for home 
            showAddButton = currentItems.length < 25;
        }
        return (
                <Modal open={this.state.CreateEditVocabularyModalOpen} onClose={this.closeCreateEditVocabularyModal} size='large'>
                    <Modal.Header>{this.state.currentTitle}</Modal.Header>
                    <Modal.Content>
                        {renderModal}
                        <Divider hidden/>
                        <VocabularyGrid onAddNewItem={this.openAddEditItemModal} currentItems={this.state.currentItems} onSelectedItem={this.selectItem} selectedItemIndex={this.state.selectedItemIndex} itemSelected={this.state.itemSelected} showAddButton={showAddButton}/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button disabled={!this.state.itemSelected} onClick={() =>this.modifyItem()}>Modify</Button>
                        <Button disabled={!this.state.itemSelected} onClick={() =>this.removeItem()}>Remove</Button>
                        <Button disabled={this.state.goBackDisabled} onClick={() =>this.goBack()}>Back</Button>
                        <Button disabled={!this.state.itemSelected} onClick={() =>this.viewChildren()}>View Children</Button>
                        <Button disabled={this.state.saveButtonDisabled} onClick={() =>this.saveBoard()}>Save Board</Button>
                    </Modal.Actions>
                </Modal>
        )
    }
}
