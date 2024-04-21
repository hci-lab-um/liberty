import React, { Component } from 'react'
import {Grid, Image} from 'semantic-ui-react'
import {DragSource, DropTarget} from 'react-dnd'
import {getHighlightColor} from '../actions/configactions'

// Note that for drag and drop an item is both a drag source and a drop source
// Items are being dropped into other items

// definition of type required by React DnD
const Types = {
    ITEM: 'GridItem'
}
// define itemSource for drag and drop
const itemSource = {
    beginDrag(props){
        return {index: props.index};
    }
}

// define drop source of drag and drop
const dropSource ={
    drop(props, monitor){
        let fromIndex = monitor.getItem().index;
        let toIndex = props.index;
        // get the index of the dragged item and the index of where the item was dropped
        props.onRepositionItem(fromIndex, toIndex);
    }
}

// collect function used for drag and drop
function collect(connect, monitor){
    return{
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }
}

// drop collect function used for drag and drop
function dropCollect(connect, monitor){
    return {
      connectDropTarget: connect.dropTarget()
    }
  }

class VocabularyItem extends Component {

    constructor(props){
        super(props);
        this.state = {
            bgColor: ""
        }
        this.colorItem = this.colorItem.bind(this);
    }

    // colour item if the item is clicked
    colorItem(props = this.props){
        if(props.selected){
        let color = getHighlightColor(); // same colour as the scanning colour
        this.setState({
            bgColor: color
          });
        }
          else{
            this.setState({
                bgColor: ""
              });
          }
    }

    componentWillReceiveProps(nextProps){
        this.colorItem(nextProps);
    }

    handleItemClick(){
        this.props.selectItem(index); //call parent's component method when item is clicked       
    }

    render() {
        const {elem, index,connectDragSource, connectDropTarget} = this.props;  
        var divStyle = {
            backgroundColor: this.state.bgColor
        }
        // wrap the returned component in the connectDragSource and connectDtopTarget functions
        return connectDragSource(connectDropTarget(
            <div>
            <Grid.Column  onClick={() =>this.props.selectItem(index)}  >
                <div className='gridItem' style={divStyle}>
                    <Image src={elem.image} size='small' centered/>
                    <p>{elem.title}</p>
                </div>
            </Grid.Column>    
            </div>
        ))
    }
}

// Higher Order Component wrapper for exported component
export default DragSource(Types.ITEM, itemSource, collect)(DropTarget(Types.ITEM, dropSource, dropCollect)(VocabularyItem));
