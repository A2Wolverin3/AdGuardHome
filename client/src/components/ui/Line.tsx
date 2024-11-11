import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import round from 'lodash/round';
import './Line.css';

interface LineProps {
    data: any[];
    color?: string;
    width?: number;
    height?: number;
    formatX?: (x: number) => string;
    formatY?: (x: number) => string;
}

const Line = ({ data, color = 'black', formatX = (x) => String(x), formatY = (y) => String(round(y, 2)) }: LineProps) => {
    return (
        <ResponsiveLine
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

                return (
                    <div className="line__tooltip">
                        <span className="line__tooltip-text">
                            <strong>{yFormatted}</strong>

                            <br />

                            <small>{xFormatted}</small>
                        </span>
                    </div>
                );
            }}
        />
    );
};

export default Line;
