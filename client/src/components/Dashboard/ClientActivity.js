import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import subDays from 'date-fns/sub_days';
import addHours from 'date-fns/add_hours';
import subHours from 'date-fns/sub_hours';
import dateFormat from 'date-fns/format';
import { msToDays, msToHours } from '../../helpers/helpers';
import { TIME_UNITS } from '../../helpers/constants';

import Card from '../ui/Card';
import Bar from '../ui/Bar';

const ClientActivity = ({
    t, subtitle, refreshButton, clientActivity, clientInfo,
}) => {
    const {
        reportInterval: interval,
        timeUnits,
    } = useSelector((state) => state.stats);

    const keys = clientInfo?.activeKeys ?? clientActivity.forEach((slice) => {
        Object.keys(slice).forEach((key) => {
            if (key !== 'id' && !keys.includes(key)) {
                keys.push(key);
            }
        });
    });

    const formatClientId = (id) => {
        const name = clientInfo?.mappedNames[id];

        if (name === '') {
            return id;
        }

        return `${name} (${id})`;
    };

    const formatIndex = (x) => {
        if (timeUnits === TIME_UNITS.HOURS) {
            const hoursAgo = msToHours(interval) - x - 1;
            return dateFormat(subHours(Date.now(), hoursAgo), 'D MMM HH:00');
        }
        let daysAgo = subDays(Date.now(), msToDays(interval) - 1);
        daysAgo = subHours(daysAgo, daysAgo.getHours());
        return dateFormat(addHours(daysAgo, (x * 12)), 'D MMM YYYY - A');
    };

    return <Card
        title={t('stats_client_activity')}
        subtitle={subtitle}
        type="card--full"
        bodyType="card-wrap"
        refresh={refreshButton}
    >
        <div className="card-barchart-bg">
            <Bar data={clientActivity}
                indexBy="id"
                keys={keys}
                formatId={formatClientId}
                formatIndex={formatIndex}
            />
        </div>
    </Card>;
};

ClientActivity.propTypes = {
    clientActivity: PropTypes.arrayOf(PropTypes.object).isRequired,
    refreshButton: PropTypes.node.isRequired,
    subtitle: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    clientInfo: PropTypes.object,
};

export default withTranslation()(ClientActivity);
