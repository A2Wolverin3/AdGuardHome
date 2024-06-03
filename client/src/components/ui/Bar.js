import React from 'react';
import { useHistory } from 'react-router-dom';
import { ResponsiveBarCanvas } from '@nivo/bar';
import PropTypes from 'prop-types';
import './Bar.css';

const Bar = ({
    data, indexBy = 'id', keys = ['value'], colors = { scheme: 'paired' }, formatId = (id) => id, formatIndex = (x) => x,
}) => {
    const history = useHistory();

    return <ResponsiveBarCanvas
        data={data}
        keys={keys}
        indexBy={indexBy}
        margin={{
            top: 10, // wiggle room for text
            right: 0, // add more if including legend
            bottom: 0, // wiggle room for text - add more if including bottom axis
            left: 0, // add more if including ticks or left axis
        }}
        padding={0} // spacing between bars
        colors={colors}
        animate={true}
        axisTop={null}
        axisRight={null}
        axisBottom={null}
        axisLeft={null}
        enableGridY={false}
        enableLabel={false}
        // labelSkipHeight={12} // Bars shorter than this are left unlabelled
        tooltip={(node) => {
            // node: {
            //     id:             string | number, // id for the bar fragment
            //     value:          number, // value for the bar fragment
            //     formattedValue: string,
            //     index:          number, // index of entire bar
            //     indexValue:     string | number, // Raw value of the 'slice' - aka, the 'id' of the data object
            //     color:          string, // Color of the selected bar fragment
            //     label:          string, // Standard "{id} - {index}" string used by default
            //     data:           object, // The raw source data object for the entire bar
            // }

            return <div className="bar__tooltip">
                <span className="bar__tooltip-text">
                    <strong><u>{formatId(node.id)}</u></strong>
                    <br />
                    <strong>{node.value}</strong>
                    <br />
                    <small>{formatIndex(node.index)}</small>
                </span>
            </div>;
        }}
        onClick={(node) => {
            history.push(`logs?search="${encodeURIComponent(node.id)}"`);
        }}
    />;
};

Bar.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    indexBy: PropTypes.string,
    keys: PropTypes.array,
    colors: PropTypes.array,
    width: PropTypes.number,
    height: PropTypes.number,
    formatId: PropTypes.func,
    formatIndex: PropTypes.func,
};

export default Bar;
