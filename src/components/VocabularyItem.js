import React, { useState, useEffect } from 'react';
import { Grid, Image } from 'semantic-ui-react';
import { useDrag, useDrop } from 'react-dnd';
import { getHighlightColor } from '../actions/configactions';

// definition of type required by React DnD
const Types = {
    ITEM: 'GridItem'
};

const VocabularyItem = (props) => {
    const [bgColor, setBgColor] = useState("");

    // usingg the useDrag hook to enable drag functionality
    const [{ isDragging }, dragRef] = useDrag({
        type: Types.ITEM,
        item: { index: props.index },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    });
    
    // using the useDrop hook to enable drop functionality
    const [, dropRef] = useDrop({
        accept: Types.ITEM,
        drop(item, monitor) {
            const fromIndex = monitor.getItem().index;
            const toIndex = props.index;
            if (fromIndex !== toIndex) {
                props.onRepositionItem(fromIndex, toIndex);
            }
        },
    });

    // colouring the item if it was clicked before 
    useEffect(() => {
        if (props.selected) {
            const color = getHighlightColor();
            setBgColor(color);
        } else {
            setBgColor("");
        }
    }, [props.selected]);

    //handling the item click 
    const handleItemClick = () => {
        props.selectItem(props.index);
    };

    const { elem } = props;
    const divStyle = {
        backgroundColor: bgColor,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={dragRef} onClick={handleItemClick}>
            <Grid.Column>
                <div className='gridItem' style={divStyle} ref={dropRef}>
                    <Image src={elem.image} size='small' centered/>
                    <p>{elem.title}</p>
                </div>
            </Grid.Column>
        </div>
    );
};

export default VocabularyItem;
