import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { useTranslation, Trans } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';
import classNames from 'classnames';
import { createOnBlurHandler } from '../../helpers/helpers';
import useDebounce from '../../helpers/useDebounce';
import { renderInputField, toNumber } from '../../helpers/form';
import {
    FORM_NAME,
    UINT32_RANGE,
    DEBOUNCE_FILTER_TIMEOUT,
} from '../../helpers/constants';

const FIELD_NAMES = {
    limit: 'limit',
    search: 'search',
};

const DEFAULT_ACTIVITY_FILTER = {
    limit: 0,
    search: '',
};

const renderSearchField = ({
    input,
    id,
    className,
    placeholder,
    type,
    disabled,
    autoComplete,
    onClearInputClick,
    onKeyDown,
    normalizeOnBlur,
}) => {
    const onBlur = (event) => createOnBlurHandler(event, input, normalizeOnBlur);

    return <>
        <div className="input-group-search input-group-search__icon--magnifier">
            <svg className="icons icon--24 icon--gray">
                <use xlinkHref="#magnifier" />
            </svg>
        </div>
        <input
            {...input}
            id={id}
            placeholder={placeholder}
            type={type}
            className={className}
            disabled={disabled}
            autoComplete={autoComplete}
            aria-label={placeholder}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
        />
        <div
            className={classNames('icon--left-25 input-group-search input-group-search__icon--cross', { invisible: input.value.length < 1 })}>
            <svg className="icons icon--20 icon--gray" onClick={onClearInputClick}>
                <use xlinkHref="#cross" />
            </svg>
        </div>
    </>;
};

renderSearchField.propTypes = {
    input: PropTypes.object.isRequired,
    id: PropTypes.string.isRequired,
    onClearInputClick: PropTypes.func.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    disabled: PropTypes.string,
    autoComplete: PropTypes.string,
    onKeyDown: PropTypes.func,
    normalizeOnBlur: PropTypes.func,
    meta: PropTypes.shape({
        touched: PropTypes.bool,
        error: PropTypes.object,
    }).isRequired,
};

const ClientActivityFilter = (props) => {
    const {
        className,
        maxClients = UINT32_RANGE.MAX,
        applyFilter,
        change,
    } = props;

    const { t } = useTranslation();

    const {
        limit, search,
    } = useSelector((state) => state?.form[FORM_NAME.CLIENT_ACTIVITY_FILTER].values, shallowEqual);

    const [
        debouncedSearch, // setDebouncedSearch,
    ] = useDebounce(search?.trim(), DEBOUNCE_FILTER_TIMEOUT);

    const [
        debouncedLimit, // setDebouncedLimit,
    ] = useDebounce(limit, DEBOUNCE_FILTER_TIMEOUT);

    const onSearchClear = async () => {
        change(FIELD_NAMES.search, DEFAULT_ACTIVITY_FILTER.search);
    };

    const onEnterPress = (e) => {
        if (e.key === 'Enter') {
            // Potential TODO
            // Filtering works without pressing 'Enter' via debounce. But it might be useful
            // to include filtering in URL query params. Pressing 'Enter' will cause the
            // url query params to take on the current filter state.
            // const tsearch = search.trim();
            // history.replace(`${getReportFilterUrlParams(tsearch, limit)}`);
            // setDebouncedSearch(tsearch);
            // setDebouncedLimit(limit)
        }
    };

    const normalizeOnBlur = (data) => data.trim();

    const renderLimitOptions = (maxClients) => (
        [...Array(maxClients + 1).keys()].map((i) => {
            if (i === 0) {
                return <option key={i} value="">{ t('activity_filter_all_clients') }</option>;
            }
            return <option key={i} value={i}>{ t('activity_filter_limit', { count: i }) }</option>;
        })
    );

    const useSelectOptionsForLimit = (maxClients <= 64);

    useEffect(() => {
        applyFilter({ limit: debouncedLimit, search: debouncedSearch });
    }, [debouncedLimit, debouncedSearch]);

    return (
        <form
            className={classNames('form-control--container', className)}
            onSubmit={(e) => {
                e.preventDefault();
            }}
        >
            <div className="field__filter-search">
                <Field
                    id={FIELD_NAMES.search}
                    name={FIELD_NAMES.search}
                    component={renderSearchField}
                    type="text"
                    className={classNames('form-control form-control--search form-control--transparent')}
                    placeholder={t('activity_filter_clientid_or_ip')}
                    onClearInputClick={onSearchClear}
                    onKeyDown={onEnterPress}
                    normalizeOnBlur={normalizeOnBlur}
                />
            </div>
            <div className="field__filter-limit">
                { useSelectOptionsForLimit
                    && <Field
                        id={FIELD_NAMES.limit}
                        name={FIELD_NAMES.limit}
                        component="select"
                        type="select"
                        className={classNames('form-control form-control-sm form-control--transparent')}
                    >
                        {renderLimitOptions(maxClients)}
                    </Field>
                }
                { !useSelectOptionsForLimit && <>
                    <label htmlFor={FIELD_NAMES.limit}
                        className={classNames('form-label align-content-center')}>
                        <Trans>activity_filter_limit_label</Trans>
                    </label>
                    <Field
                        id={FIELD_NAMES.limit}
                        name={FIELD_NAMES.limit}
                        type="number"
                        component={renderInputField}
                        className={classNames('form-control form-control-sm w-8 form-control--transparent')}
                        placeholder={'#'}
                        normalize={toNumber}
                        min={0}
                        max={maxClients}
                    />
                </>}
            </div>
        </form>
    );
};

ClientActivityFilter.propTypes = {
    applyFilter: PropTypes.func.isRequired,
    change: PropTypes.func.isRequired,
    className: PropTypes.string,
    maxClients: PropTypes.number,
};

export default reduxForm({
    form: FORM_NAME.CLIENT_ACTIVITY_FILTER,
    enableReinitialize: true,
})(ClientActivityFilter);
