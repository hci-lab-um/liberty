import React, { Component } from 'react'
import {Modal, Button, Form, Image, Divider} from 'semantic-ui-react'
const {ipcRenderer} = window.require('electron')

class AddEditItemModal extends Component {
    constructor(props){
        super(props);
        this.state={
            addItemModalOpen: false,
            addItemName: "",
            addItemFunction: "",
            addItemImage: "",
            title: "Add New Item",
            buttonText: "Add Item"
        }
        
        this.closeAddEditItemModal = this.closeAddEditItemModal.bind(this);
        this.openAddEditItemModal = this.openAddEditItemModal.bind(this);
        this.handleAddImage = this.handleAddImage.bind(this);
        this.handleImageLoaded = this.handleImageLoaded.bind(this);
        this.handleItemTitleChange = this.handleItemTitleChange.bind(this);
        this.handleFunctionNameChange = this.handleFunctionNameChange.bind(this);
        this.addUpdateItem = this.addUpdateItem.bind(this);
        this.defaultCursor = null;
        this.cursorImgOpacity = null;
    }  

    closeAddEditItemModal(){
        // set state to false to close modal
        this.setState({addItemModalOpen: false});
        this.props.onCloseAddItemModal();
    }

    openAddEditItemModal = (e) =>{
        // set state to true to show modal
        this.setState({addItemModalOpen: true});
    }


    handleAddImage(){
        // dispatch message to main process to open dialog to select new item
        ipcRenderer.send('addImageToNewItem');
    }

    handleImageLoaded = (event, imagePath) =>{
        this.setState({addItemImage: imagePath});
    }

    handleItemTitleChange = (e) =>{
        this.setState({addItemName: e.target.value});
    }

    handleFunctionNameChange = (e) =>{
        this.setState({addItemFunction: e.target.value});
    }

    addUpdateItem(){
        // pass the added or updated item to the parent component
        this.props.onButtonClick(this.state.addItemName, this.state.addItemFunction, this.state.addItemImage);
        this.setState({addItemModalOpen: false, addItemName: "", addItemFunction: "", addItemImage:""});
    }

    componentDidMount(){
        // add event listener to listen for message from main process with the image path
        ipcRenderer.on('imageSent', this.handleImageLoaded);
        this.cursorImgOpacity = document.querySelector('.cursor-img').style.opacity; 
        this.defaultCursor = document.body.style.cursor; 
        document.body.style.cursor = 'auto';
        document.querySelector('.cursor-img').style.opacity = '0';
    }

    componentWillUnmount(){
        // remove event listener on unmounting of component
        ipcRenderer.removeListener('imageSent', this.handleImageLoaded); 
        document.body.style.cursor = this.defaultCursor;
        document.querySelector('.cursor-img').style.opacity = this.cursorImgOpacity;
    }

    componentWillReceiveProps(nextProps){
        this.setState({addItemModalOpen:nextProps.open}); // open modal window
        // update state according to whether a new item is being added or the item is being edited
        if(nextProps.editMode){
            this.setState({addItemName : nextProps.selectedItem.title , addItemFunction : nextProps.selectedItem.function , addItemImage : nextProps.selectedItem.image
                , title: "Modify Item", buttonText: "Modify"});
        }else{
            this.setState({addItemName : "" , addItemFunction : "" , addItemImage : "", title: "Add New Item", buttonText: "Add Item"});
        }
    }

    render() {
        return (
            <Modal 
                open={this.state.addItemModalOpen} onClose={this.closeAddEditItemModal}>
                    <Modal.Header>{this.state.title}</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Input value={this.state.addItemName} fluid label='Title' placeholder='Item 1' onChange={this.handleItemTitleChange}/>
                            <Form.Group>
                                <Form.Button onClick={this.handleAddImage}>Add Image</Form.Button>
                                <Image src={this.state.addItemImage} size='medium' bordered centered/>
                            </Form.Group>
                        </Form>
                        <Divider hidden/>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button onClick={this.addUpdateItem}>{this.state.buttonText}</Button>
                    </Modal.Actions>
            </Modal>
        )
    }
}


export default AddEditItemModal;
