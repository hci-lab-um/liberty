import React, { Component } from 'react'
import {Header, Divider} from 'semantic-ui-react'
import GridBoard from './GridBoard'
import CreateEditVocabularyModal from './CreateEditVocabularyModal'
import ConfigBoardModal from './ConfigBoardModal'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
const {ipcRenderer} = window.require('electron')

class Main extends Component {
  constructor(props){
    super(props);
    this.state= {
      editMode : false,
      vocabularyToEdit : [],
      createBoardModalOpen : false,
      currentTitle: "Home",
      previousTitles: [],
      gridBoardHeight: (window.innerHeight - 150)
    }

    this.renderCreateEditVocabularyModal = this.renderCreateEditVocabularyModal.bind(this);
    this.eventCreateVocabulary = this.eventCreateVocabulary.bind(this);
    this.handleGoToSubFolder = this.handleGoToSubFolder.bind(this);
    this.handleGoBackFromFolder = this.handleGoBackFromFolder.bind(this);
    this.handleFreshBoard = this.handleFreshBoard.bind(this);
    this.closeCreateEditVocabularyModal = this.closeCreateEditVocabularyModal.bind(this);
    this.handleResize = this.handleResize.bind(this);
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

  handleResize() {
    this.setState({ gridBoardHeight: window.innerHeight - 150 });
  }

  componentDidMount(){
    // add event listeners on component mount
    ipcRenderer.on('createBoard', this.eventCreateVocabulary);
    ipcRenderer.on('editExistingBoard', this.handleEditExistingVocabulary);
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount(){
    // remove event listeners on component unmount to avoid memory leakage
    ipcRenderer.removeListener('createBoard', this.renderCreateEditVocabularyModal);
    window.removeEventListener('resize', this.handleResize);
  }

  render() {
    const renderCreateEditBoardModal = this.renderCreateEditVocabularyModal();
    const headerHeight = 36;
    return (
      <DndProvider backend={HTML5Backend}>      
        <div style={{ height: `${window.innerHeight}px` }}>
          <div style={{ height: `${headerHeight}px` }}>
            <Header as='h1' textAlign='center'>{this.state.currentTitle}</Header>
          </div>
          <GridBoard key={this.state.gridBoardHeight} height={this.state.gridBoardHeight} onGoToSubFolder={this.handleGoToSubFolder} onGoBackFromFolder={this.handleGoBackFromFolder} onFreshBoard={this.handleFreshBoard}/>
          {renderCreateEditBoardModal}
          <ConfigBoardModal />
        </div>
        </DndProvider>
    )
  }
}

export default Main;
