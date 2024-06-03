import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import round from 'lodash/round';
import PropTypes from 'prop-types';
import './Line.css';

const Line = ({
    data,
    color = 'black',
    formatX = (x) => x,
    formatY = (y) => round(y, 2),
}) => {
    return <ResponsiveLine
        enableArea
        animate
        enableSlices="x"
        curve="linear"
        colors={[color]}
        data={data}
        theme={{
            crosshair: {
                line: {
                    stroke: 'currentColor',
                    strokeWidth: 1,
                    strokeOpacity: 0.5,
                },
            },
        }}
        xScale={{
            type: 'linear',
            min: 0,
            max: 'auto',
        }}
        crosshairType="x"
        axisLeft={null}
        axisBottom={null}
        enableGridX={false}
        enableGridY={false}
        enablePoints={false}
        xFormat={formatX}
        yFormat={formatY}
        sliceTooltip={(slice) => {
            const { xFormatted, yFormatted } = slice.slice.points[0].data;
            return <div className="line__tooltip">
                <span className="line__tooltip-text">
                    <strong>{yFormatted}</strong>
                    <br />
                    <small>{xFormatted}</small>
                </span>
            </div>;
        }}
    />;
};

Line.propTypes = {
    data: PropTypes.array.isRequired,
    formatX: PropTypes.func,
    formatY: PropTypes.func,
    color: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
};

export default Line;
