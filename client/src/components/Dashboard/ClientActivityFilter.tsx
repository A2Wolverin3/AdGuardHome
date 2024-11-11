import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Field, type InjectedFormProps, reduxForm } from 'redux-form';
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
import { RootState } from '../../initialState';


const FIELD_NAMES = {
    limit: 'limit',
    search: 'search',
};

const DEFAULT_ACTIVITY_FILTER = {
    limit: 0,
    search: '',
};

interface RenderSearchFieldProps {
    input: any;
    id: string;
    onClearInputClick: (...args: unknown[]) => unknown;
    className?: string;
    placeholder?: string;
    type?: string;
    disabled?: string;
    autoComplete?: string;
    onKeyDown?: (...args: unknown[]) => unknown;
    normalizeOnBlur?: (...args: unknown[]) => unknown;
    meta: { touched: boolean, error: any };
}

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
}: RenderSearchFieldProps) => {
    const onBlur = (event: any) => createOnBlurHandler(event, input, normalizeOnBlur);

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

interface ClientActivityFilterProps {
    applyFilter: (...args: unknown[]) => unknown;
    className?: string;
    maxClients?: number;
};

const ClientActivityFilter = (props: ClientActivityFilterProps & InjectedFormProps) => {
    const { className, maxClients = UINT32_RANGE.MAX, applyFilter, change } = props;

    const { t } = useTranslation();

    const {
        limit, search,
    } = useSelector((state: RootState) => state?.form[FORM_NAME.CLIENT_ACTIVITY_FILTER].values, shallowEqual);

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

    const normalizeOnBlur = (data: any) => data.trim();

    const renderLimitOptions = (maxClients: any) => (
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
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
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

export default reduxForm<{}, ClientActivityFilterProps>({
    form: FORM_NAME.CLIENT_ACTIVITY_FILTER,
    enableReinitialize: true,
})(ClientActivityFilter);
