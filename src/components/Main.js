import React, { Component } from 'react'
import {Header, Divider} from 'semantic-ui-react'
import GridBoard from './GridBoard'
import CreateEditVocabularyModal from './CreateEditVocabularyModal'
import ConfigBoardModal from './ConfigBoardModal'
import HTML5Backend from 'react-dnd-html5-backend'
import {DragDropContext} from 'react-dnd'
const {ipcRenderer} = window.require('electron')

class Main extends Component {
  constructor(props){
    super(props);
    this.state= {
      editMode : false,
      vocabularyToEdit : [],
      createBoardModalOpen : false,
      currentTitle: "Home",
      previousTitles: []
    }

    this.renderCreateEditVocabularyModal = this.renderCreateEditVocabularyModal.bind(this);
    this.eventCreateVocabulary = this.eventCreateVocabulary.bind(this);
    this.handleGoToSubFolder = this.handleGoToSubFolder.bind(this);
    this.handleGoBackFromFolder = this.handleGoBackFromFolder.bind(this);
    this.handleFreshBoard = this.handleFreshBoard.bind(this);
    this.closeCreateEditVocabularyModal = this.closeCreateEditVocabularyModal.bind(this);
  }

  closeCreateEditVocabularyModal(){
    // handle closing of 
    this.setState({createBoardModalOpen: false , editMode: false , vocabularyToEdit: []});
  }

  renderCreateEditVocabularyModal(){
    // pass paramter to render the modal either as edit existing vocabulary or create new voCABULARY
    return(<CreateEditVocabularyModal editMode={this.state.editMode} vocabularyToEdit = {this.state.vocabularyToEdit} open={this.state.createBoardModalOpen} onClose={this.closeCreateEditVocabularyModal}/>);
  }

  eventCreateVocabulary(){
    // show create vocabulary modal window on signal from main process
    this.setState({createBoardModalOpen: true});
  }

  handleGoToSubFolder=(title)=>{
    // change the title when a sub-folder is entered
    this.setState({previousTitles: [...this.state.previousTitles, this.state.currentTitle], currentTitle: title})
  }

  handleGoBackFromFolder = () =>{
    // change title when a sub-folder is exited
    this.setState({currentTitle: this.state.previousTitles.pop()});
  }

  handleFreshBoard = () =>{
    // on initial load on board
    this.setState({currentTitle: "Home", previousTitles: []});
  }
  
  handleEditExistingVocabulary = (event, vocabulary) => {
    //change state values on event to edit existing vocabulary
    this.setState({editMode : true , vocabularyToEdit : vocabulary, createBoardModalOpen:true}  )
  }

  componentDidMount(){
    // add event listeners on component mount
    ipcRenderer.on('createBoard', this.eventCreateVocabulary);
    ipcRenderer.on('editExistingBoard', this.handleEditExistingVocabulary);
  }

  componentWillUnmount(){
    // remove event listeners on component unmount to avoid memory leakage
    ipcRenderer.removeListener('createBoard', this.renderCreateEditVocabularyModal);
  }

  render() {
    const renderCreateEditBoardModal = this.renderCreateEditVocabularyModal();
    return (
      <div>
        <Header as='h1' textAlign='center'>{this.state.currentTitle}</Header>
        <Divider  hidden/>
        <GridBoard onGoToSubFolder={this.handleGoToSubFolder} onGoBackFromFolder={this.handleGoBackFromFolder} onFreshBoard={this.handleFreshBoard}/>
        {renderCreateEditBoardModal}
        <ConfigBoardModal />
      </div>
    )
  }
}

// Documentation suggests to put the drag and drop context wrapper in the outer component
export default DragDropContext(HTML5Backend)(Main);
