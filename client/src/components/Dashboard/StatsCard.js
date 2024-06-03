import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import addDays from 'date-fns/add_days';
import subDays from 'date-fns/sub_days';
import subHours from 'date-fns/sub_hours';
import dateFormat from 'date-fns/format';
import { formatNumber, msToDays, msToHours } from '../../helpers/helpers';
import { STATUS_COLORS, TIME_UNITS } from '../../helpers/constants';

import Card from '../ui/Card';
import Line from '../ui/Line';

const StatsCard = ({
    total, lineData, percent, title, color,
}) => {
    const interval = useSelector((state) => state.stats.interval);
    const timeUnits = useSelector((state) => state.stats.timeUnits);

    const formatX = (x) => {
        if (timeUnits === TIME_UNITS.HOURS) {
            const hoursAgo = msToHours(interval) - x - 1;
            return dateFormat(subHours(Date.now(), hoursAgo), 'D MMM HH:00');
        }

        const daysAgo = subDays(Date.now(), msToDays(interval) - 1);
        return dateFormat(addDays(daysAgo, x), 'D MMM YYYY');
    };

    return <Card type="card--full" bodyType="card-wrap">
        <div className="card-body-stats">
            <div className={`card-value card-value-stats text-${color}`}>
                {formatNumber(total)}
            </div>
            <div className="card-title-stats">{title}</div>
        </div>
        {percent >= 0 && (
            <div className={`card-value card-value-percent text-${color}`}>
                {percent}
            </div>
        )}
        <div className="card-chart-bg">
            <Line data={lineData} color={STATUS_COLORS[color]} formatX={formatX} />
        </div>
    </Card>;
};

StatsCard.propTypes = {
    total: PropTypes.number.isRequired,
    lineData: PropTypes.array.isRequired,
    title: PropTypes.object.isRequired,
    color: PropTypes.string.isRequired,
    percent: PropTypes.number,
};

export default StatsCard;
