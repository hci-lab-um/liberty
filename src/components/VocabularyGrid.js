import React, { Component } from 'react'
import {Grid, Form} from 'semantic-ui-react'
import VocabularyItem from './VocabularyItem'

class VocabularyGrid extends Component {
  constructor(props){
    super(props);
    this.state ={
      currentItems: []
    }
    this.handleItemsRepositioning = this.handleItemsRepositioning.bind(this);
    this.handleSelectItem = this.handleSelectItem.bind(this);
  }

  // re-position items on drag and drop
  handleItemsRepositioning(fromIndex, toIndex){
    var item = this.state.currentItems[fromIndex];
    var currentItems = this.state.currentItems;
    currentItems.splice(fromIndex, 1); // remove item from index
    currentItems.splice(toIndex, 0, item); // add item to new index
    this.setState({currentItems});
  }

  handleSelectItem(itemIndex){
    // call parent component function on item selection
    this.props.onSelectedItem(itemIndex);
  }

   componentWillReceiveProps(nextProps){
     // update state with new vocabylary items
    this.setState({currentItems: nextProps.currentItems})
  }

  render() {
    const {itemSelected, selectedItemIndex} = this.props;
    // style for add new item plus button
    var addStyle = {
      height: 150,
      width: 150,
      fontSize: 40,
      position: 'relative',
      bottom: 15,
      right: 14
    }
    return(
        <Grid columns={7} className='createBoardGrid'>
          {this.state.currentItems.map((elem,index) =>
              <VocabularyItem key={index} elem={elem} index={index} onRepositionItem={this.handleItemsRepositioning} selectItem={this.handleSelectItem} 
              selected={itemSelected && index == selectedItemIndex}/>
          )}
          <Grid.Column onClick={()=> this.props.onAddNewItem()}>
            <Form.Button style={addStyle}>
              +
            </Form.Button>
          </Grid.Column>
        </Grid>
    )
  }
}

export default VocabularyGrid;
