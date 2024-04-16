import React, { Component } from 'react'
import { Grid, Image, Transition, Icon } from 'semantic-ui-react';
import { getHighlightColor, getTransition, getScanningType, getHoverDuration } from '../actions/configactions';
import * as scanningTypes from '../configuration/scanningtypes'

class GridItem extends Component {
    constructor(props){
        super(props);
        this.state = {
            bgColor: "",
            transitionActive:true,
            transitionType: getTransition(),
            showTitle: true,
            hoverDuration: getHoverDuration()
          }
        this.colorItem = this.colorItem.bind(this);
        this.toggleTransition = this.toggleTransition.bind(this);
    }

    getCurrentHoverDuration(){
      this.setState({hoverDuration: getHoverDuration()});
    }

    toggleTransition(){
      // activate transition on item
      this.setState({transitionActive: !this.state.transitionActive});
    }

    handleTransitionChange =(event)=>{
      // handle event of user changing the transition type
      this.setState({transitionType: getTransition()});
    }

    componentWillMount(){
      // call function when component will mount
        this.colorItem();
    }

    componentDidMount(){
      // listen to event
      document.addEventListener('transitionChanged', this.handleTransitionChange);
    }

    componentWillUnmount(){
      // remove event listener
      document.removeEventListener('transitionChanged', this.handleTransitionChange);
    }

    componentWillReceiveProps(nextProps){
      // call functions when component receives props
        this.colorItem(nextProps);
        this.getCurrentHoverDuration();
      // toggle transition when item is selected
        if(nextProps.itemActivated) 
          this.toggleTransition();
    }

    colorItem(props = this.props){
      // color item if it is being scanned
        if(props.selected){
        let color = getHighlightColor();
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

    handleMouseEnter = () => {
      if (getScanningType() === scanningTypes.MOUSE_SCANNING) {
        //console.log("Current hover duration: ", this.state.hoverDuration);
        console.log('Mouse entered the grid item.');
        document.dispatchEvent(new CustomEvent('hoverScanning', {detail: this.props.id}));
        this.hoverTimeout = setTimeout(() => {
            document.dispatchEvent(new CustomEvent('hoverSelection'));
        }, this.state.hoverDuration);
      }
    }

    handleMouseLeave = () => {
        if (getScanningType() === scanningTypes.MOUSE_SCANNING) {
          console.log('Mouse left the grid item.');
          clearTimeout(this.hoverTimeout);
        }
    }

    render() {
      return (
          <Transition animation={this.state.transitionType} duration={500} visible={this.state.transitionActive}>
              <Grid.Column {...(this.state.bgColor!== ''? {color:this.state.bgColor}:{})} floated='left' className="gridColumn" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                  <div className='gridItem'>
                      <Image src={this.props.item.image} size='small' centered />
                      <p>
                          {this.state.showTitle && <span>{this.props.item.title} </span>}
                          <span>{this.props.isParent && <Icon name='folder'/>}</span>
                      </p>            
                  </div>
              </Grid.Column>
          </Transition>
      )
  }
}

export default GridItem;