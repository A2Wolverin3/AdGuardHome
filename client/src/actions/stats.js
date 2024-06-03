import { createAction } from 'redux-actions';

import apiClient from '../api/Api';
import {
    normalizeTopStats, secondsToMilliseconds, getClientKeysFromActivity, getParamsForClientsSearch, addClientInfo,
} from '../helpers/helpers';
import { addErrorToast, addSuccessToast } from './toasts';

export const getStatsConfigRequest = createAction('GET_STATS_CONFIG_REQUEST');
export const getStatsConfigFailure = createAction('GET_STATS_CONFIG_FAILURE');
export const getStatsConfigSuccess = createAction('GET_STATS_CONFIG_SUCCESS');

export const getStatsConfig = () => async (dispatch) => {
    dispatch(getStatsConfigRequest());
    try {
        const data = await apiClient.getStatsConfig();
        dispatch(getStatsConfigSuccess(data));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(getStatsConfigFailure());
    }
};

export const setStatsConfigRequest = createAction('SET_STATS_CONFIG_REQUEST');
export const setStatsConfigFailure = createAction('SET_STATS_CONFIG_FAILURE');
export const setStatsConfigSuccess = createAction('SET_STATS_CONFIG_SUCCESS');

export const setStatsConfig = (config) => async (dispatch) => {
    dispatch(setStatsConfigRequest());
    try {
        await apiClient.setStatsConfig(config);
        dispatch(addSuccessToast('config_successfully_saved'));
        dispatch(setStatsConfigSuccess(config));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(setStatsConfigFailure());
    }
};

export const getStatsRequest = createAction('GET_STATS_REQUEST');
export const getStatsFailure = createAction('GET_STATS_FAILURE');
export const getStatsSuccess = createAction('GET_STATS_SUCCESS');

export const getStats = () => async (dispatch) => {
    dispatch(getStatsRequest());
    try {
        const stats = await apiClient.getStats();
        const normalizedTopClients = normalizeTopStats(stats.top_clients);
        const activeClientKeys = getClientKeysFromActivity(stats.client_activity, 'id');
        // 'activeClientKeys' is a superset of 'normalizedTopClients'
        // const clientsParams = getParamsForClientsSearch(getClientKeys(normalizedTopClients, 'name'));
        const clientsParams = getParamsForClientsSearch(activeClientKeys);
        const clients = await apiClient.findClients(clientsParams);
        const topClientsWithInfo = addClientInfo(normalizedTopClients, clients, 'name');

        const clientNames = {};
        activeClientKeys.forEach((key) => {
            const client = clients.find((item) => item[key]) || '';
            const info = client?.[key] ?? '';
            clientNames[key] = info.name ?? '';
        });

        const normalizedStats = {
            ...stats,
            top_blocked_domains: normalizeTopStats(stats.top_blocked_domains),
            top_clients: topClientsWithInfo,
            top_queried_domains: normalizeTopStats(stats.top_queried_domains),
            avg_processing_time: secondsToMilliseconds(stats.avg_processing_time),
            top_upstreams_responses: normalizeTopStats(stats.top_upstreams_responses),
            top_upstrems_avg_time: normalizeTopStats(stats.top_upstreams_avg_time),
            // 'clients' contains 'info' for all active clients now, but that's a lot
            // of information. The individual 'info' objects needed for 'top_clients'
            // are already attached to that set of stats. We only need to preserve
            // name mappings for the full client activity report.
            active_client_info: { activeKeys: activeClientKeys, mappedNames: clientNames },
        };

        dispatch(getStatsSuccess(normalizedStats));
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(getStatsFailure());
    }
};

export const resetStatsRequest = createAction('RESET_STATS_REQUEST');
export const resetStatsFailure = createAction('RESET_STATS_FAILURE');
export const resetStatsSuccess = createAction('RESET_STATS_SUCCESS');

export const resetStats = () => async (dispatch) => {
    dispatch(getStatsRequest());
    try {
        await apiClient.resetStats();
        dispatch(addSuccessToast('statistics_cleared'));
        dispatch(resetStatsSuccess());
    } catch (error) {
        dispatch(addErrorToast({ error }));
        dispatch(resetStatsFailure());
    }
};
