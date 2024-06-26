import React, { Component } from 'react'
import { Grid, Image, Transition, Icon } from 'semantic-ui-react';
import { getHighlightColor, getDwellAnimation, getTransition, getScanningType, getHoverDuration, updateCSSBgColour, getRestMode} from '../actions/configactions';
import * as scanningTypes from '../configuration/scanningtypes'

class GridItem extends Component {
    constructor(props){
        super(props);
        this.state = {
            bgColor: "",
            animationColor: getHighlightColor(),
            transitionActive:true,
            transitionType: 'jiggle',
            showTitle: true,
            hoverDuration: getHoverDuration(),
            dwellAnimation: getDwellAnimation(),
            hovered: ''
          }
        this.colorItem = this.colorItem.bind(this);
        this.toggleTransition = this.toggleTransition.bind(this);
    }

    getCurrentHoverDuration(){
      this.setState({hoverDuration: getHoverDuration()});
    }

    toggleTransition(){
      // activate transition on item
      this.setState({transitionActive: !this.state.transitionActive}, () => {
          if (!this.state.transitionActive) {
              setTimeout(() => {
                  this.setState({transitionActive: true});
              }, 500);
          }
      });
  }

    handleTransitionChange =(event)=>{
      // handle event of user changing the transition type
      this.setState({transitionType: getTransition()});
    }

    handleDwellAnimationChange =(event) =>{
      this.setState({dwellAnimation: getDwellAnimation()});
    }

    componentWillMount(){
      // call function when component will mount
        this.colorItem();
    }

    componentDidMount(){
      const root = document.documentElement;
      root.style.setProperty('--dwell-time', `${this.state.hoverDuration}ms`);
      updateCSSBgColour();
      // listen to event
      document.addEventListener('transitionChanged', this.handleTransitionChange);
      document.addEventListener('dwellAnimationChanged', this.handleDwellAnimationChange);
    }

    componentWillUnmount(){
      // remove event listener
      document.removeEventListener('transitionChanged', this.handleTransitionChange);
      document.removeEventListener('dwellAnimationChanged', this.handleDwellAnimationChange);
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
        if(props.selected && (getScanningType() !== scanningTypes.MOUSE_SCANNING)){
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
      if (getScanningType() === scanningTypes.MOUSE_SCANNING && (getRestMode() === false || this.props.item.title === "Toggle Rest Mode")) {
        this.setState({ hovered: 'hovered' });
        document.dispatchEvent(new CustomEvent('hoverScanning', {detail: this.props.id}));
        if (this.hoverTimeout) {
          clearTimeout(this.hoverTimeout);
        }
        this.hoverTimeout = setTimeout(() => {
            document.dispatchEvent(new CustomEvent('hoverSelection'));
            this.setState({ hovered: '' });
        }, this.state.hoverDuration);
      }
    }

    handleMouseLeave = () => {
        if (getScanningType() === scanningTypes.MOUSE_SCANNING && (getRestMode() === false || this.props.item.title === "Toggle Rest Mode")) {
          this.setState({ hovered: '' });
          if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
          }
        }
    }

    render() {
      return (
        
          <Transition animation={this.state.transitionType} duration={500} visible={this.state.transitionActive}>
              <Grid.Column {...(this.state.bgColor!== ''? {color:this.state.bgColor}:{})} floated='left' className={`gridColumn ${this.state.dwellAnimation} ${this.state.hovered}`} onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                  <div className="gridItem" style={{ height: `${this.props.height}px`}}>
                      <Image className="gridImage" src={this.props.item.image}  centered />
                      <p className='labelCentered'>
                          {this.state.showTitle && <span>{this.props.item.title} </span>}
                          <span>{this.props.isParent && <img className="folderImg" src='../images/folder.svg'/>}</span>
                      </p>            
                  </div>
              </Grid.Column>
          </Transition>
      )
  }
}

export default GridItem;