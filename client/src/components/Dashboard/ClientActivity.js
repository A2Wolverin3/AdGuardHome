import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import subDays from 'date-fns/sub_days';
import addHours from 'date-fns/add_hours';
import subHours from 'date-fns/sub_hours';
import dateFormat from 'date-fns/format';
import { msToDays, msToHours, getClientKeysFromActivity } from '../../helpers/helpers';
import { TIME_UNITS } from '../../helpers/constants';

import ClientActivityFilter from './ClientActivityFilter';
import Card from '../ui/Card';
import Bar from '../ui/Bar';

const ClientActivity = ({
    t, subtitle, refreshButton, clientActivity, clientInfo,
}) => {
    const {
        reportInterval: interval,
        timeUnits,
    } = useSelector((state) => state.stats);

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

    const filterKeys = (keys, filter) => {
        return Object.keys(keys)
            // First filter by name...
            .filter((ip) => {
                if (!ip || !filter || !filter.search) {
                    return true;
                }
                const search = filter.search.toUpperCase();
                if (ip.toUpperCase().includes(search)) {
                    return true;
                }
                if (clientInfo?.mappedNames[ip]?.toUpperCase().includes(search)) {
                    return true;
                }
                return false;
            })
            // Then order by usage and filter the top of clients that matched the filter
            .sort((a, b) => keys[b] - keys[a])
            .filter((_, idx) => (!filter || !filter.limit || idx < filter.limit));
    };

    // Make sure we've got our key info. If not, we'll have to generate it now.
    // Get the list in sorted order by count, highest to lowest.
    const activeKeys = clientInfo?.activeKeys ?? getClientKeysFromActivity(clientActivity, 'id') ?? {};
    const [filteredKeys, setFilteredKeys] = useState(filterKeys(activeKeys /* no initial filter */));

    const filterAndRefresh = <div className="d-flex align-items-center ml-auto">
        <ClientActivityFilter
            className="d-flex mr-3"
            initialValues={{}}
            maxClients={Object.keys(activeKeys).length}
            applyFilter={(filter) => {
                setFilteredKeys(filterKeys(activeKeys, filter));
            }}
        />
        {refreshButton}
    </div>;

    return <Card
        title={t('stats_client_activity')}
        subtitle={subtitle}
        type="card--full"
        bodyType="card-wrap"
        refresh={filterAndRefresh}
    >
        <div className="card-barchart-bg">
            <Bar data={clientActivity}
                indexBy="id"
                keys={filteredKeys}
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
