import React from 'react';
import { useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import addDays from 'date-fns/add_days';
import subDays from 'date-fns/sub_days';
import addHours from 'date-fns/add_hours';
import subHours from 'date-fns/sub_hours';
import dateFormat from 'date-fns/format';
import { msToDays, msToHours } from '../../helpers/helpers';
import { TIME_UNITS } from '../../helpers/constants';
import { RootState } from '../../initialState';

import Card from '../ui/Card';
import Bar from '../ui/Bar';

interface ClientActivityProps {
    clientActivity: any[];
    refreshButton: React.ReactNode;
    subtitle: string;
    clientInfo?: any;
    t: TFunction;
}

const ClientActivity = ({ t, subtitle, refreshButton, clientActivity, clientInfo }: ClientActivityProps) => {
    const {
        reportInterval: interval,
        timeUnits,
    } = useSelector((state: RootState) => state.stats);

    const keys: string[] = clientInfo?.activeKeys ?? clientActivity.forEach((slice: any) => {
        Object.keys(slice).forEach((key: string) => {
            if (key !== 'id' && key !== 'ts' && !keys.includes(key)) {
                keys.push(key);
            }
        });
    });

    const formatClientId = (id: string) => {
        const name = clientInfo?.mappedNames[id];

        if (name === '') {
            return id;
        }

        return `${name} (${id})`;
    };

    const formatIndex = (idx: number) => {
        const format = (timeUnits === TIME_UNITS.HOURS) ? 'D MMM HH:00' : 'D MMM YYYY - A';

        // The timestamp should be in the stats data.
        if (clientActivity[idx]['ts']) {
            const ts = new Date(clientActivity[idx]['ts'] * 1000);
            return dateFormat(ts, format);
        }
        
        // Try to calculate timestamp while formatting if not found above.
        // This assumes the browser is in the same timezone as the server, but
        // that is likely a safe assumption most of the time.
        if (timeUnits === TIME_UNITS.HOURS) {
            const hoursAgo = msToHours(interval) - idx - 1;
            return dateFormat(subHours(Date(), hoursAgo), format);
        }
        let daysAgo = subDays(Date(), msToDays(interval) - 1);
        daysAgo = subHours(daysAgo, daysAgo.getHours());
        // Add full days, and extra half day if necessary
        return dateFormat(addHours(addDays(daysAgo, idx / 2), 12 * (idx % 2)), format);
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

export default withTranslation()(ClientActivity);
