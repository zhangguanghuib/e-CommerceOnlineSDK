/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

/* eslint-disable no-duplicate-imports */
import { Autosuggestions } from '@msdyn365-commerce/commerce-entities';
import MsDyn365, { getCatalogId, getUrlSync } from '@msdyn365-commerce/core';
import { ProductRefiner, ProductRefinerSource, ProductsDataActions } from '@msdyn365-commerce/retail-proxy';
import { ArrayExtensions, ObjectExtensions, Random, validateCatalogId } from '@msdyn365-commerce-modules/retail-actions';
import { createSearchStateInput } from '@msdyn365-commerce-modules/search-utilities';
import { getTelemetryObject, IModuleProps, INodeProps, ITelemetryContent, KeyCodes } from '@msdyn365-commerce-modules/utilities';
import classnames from 'classnames';
import { debounce } from 'lodash';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react';
import * as React from 'react';

import getSearchSuggestionsAction, { AutoSuggestInput, SuggestionType } from './actions/get-auto-suggest-suggestions';
import {
    CategorySuggestionsComponent,
    FormComponent,
    ISearchCategoryViewProps,
    ISearchKeywordViewProps,
    ISearchProductViewProps,
    KeywordSuggestionsComponent,
    LabelComponent,
    ProductSuggestionsComponent
} from './components';
import { ICustomSearchData } from './custom-search.data';
import {
    ICustomSearchProps,
    ISuggestionTypeCriterionData,
    SuggestionTypeCriterionSuggestionType
} from './custom-search.props.autogenerated';

export interface ISearchState {
    isSearchFormExpanded: boolean;
    searchText: string;
    searchKeywordSuggestClass: string;
    searchProductSuggestClass: string;
    searchCategorySuggestClass: string;
    suggestions: Autosuggestions | undefined;
    searchRefiners?: ProductRefiner[] | undefined;
    autoSuggestAriaLabel: string;
    isInitialState: boolean;
    isLoadingAutoSuggest?: boolean;
}

export interface ISearchViewProps extends ICustomSearchProps<ICustomSearchData> {
    Search: IModuleProps;
    AutoSuggestAriaLabel: INodeProps;
    AutoSuggestAriaLabelText: string;
    searchText: string;
    AutoSuggest: INodeProps;
    KeywordSuggest: INodeProps;
    ProductSuggest: INodeProps;
    CategorySuggest: INodeProps;
    SearchForm: INodeProps;
    FormWrapper: INodeProps;
    UlKeyword: INodeProps;
    UlProduct: INodeProps;
    UlCategory: INodeProps;
    label: React.ReactNode;
    form: React.ReactNode;
    autosuggestKeyword?: ISearchKeywordViewProps;
    autosuggestProduct?: ISearchProductViewProps;
    autosuggestCategory?: ISearchCategoryViewProps;
    callbacks: {
        handleCancelSearchChange(): void;
        handleCancelSearchFocused?(): void;
    };
    isSearchFormExpanded: boolean;
    isLoadingAutoSuggest?: boolean;
    isLoadingNode?: React.ReactNode;
}

/**
 *
 * Search module.
 * @extends {React.Component<ICustomSearchProps<ICustomSearchData>, ISearchState>}
 */
class Search extends React.Component<ICustomSearchProps<ICustomSearchData>, ISearchState> {
    private readonly searchTextInput: React.RefObject<HTMLInputElement>;

    private readonly searchCollapsedLabel: React.RefObject<HTMLButtonElement>;

    private readonly formReference: React.RefObject<HTMLButtonElement>;

    private readonly maxChars: number;

    private readonly topResultsCount?: number;

    private readonly hitPrefix: string = '{';

    private readonly hitSuffix: string = '}';

    private readonly waitTime: number = 500;

    private readonly autoSuggestResultScreenReaderDiv: React.RefObject<HTMLDivElement>;

    private readonly autoSuggestResultDiv: React.RefObject<HTMLDivElement>;

    private readonly searchFormClass: string;

    private readonly searchLabelClass: string;

    private readonly telemetryContent: ITelemetryContent;

    private loadSuggestionsRequestId?: string;

    private inputSuggestionType: ISuggestionTypeCriterionData[];

    // @ts-expect-error
    private cancellabelDebounce: debounce;

    public constructor(props: ICustomSearchProps<ICustomSearchData>) {
        super(props);
        this.searchTextInput = React.createRef();
        this.searchCollapsedLabel = React.createRef();
        this.autoSuggestResultScreenReaderDiv = React.createRef();
        this.autoSuggestResultDiv = React.createRef();
        this.formReference = React.createRef();
        this.state = {
            isSearchFormExpanded: false,
            searchText: '',
            searchKeywordSuggestClass: 'ms-search__autoSuggest__keyword',
            searchProductSuggestClass: 'ms-search__autoSuggest__product',
            searchCategorySuggestClass: 'ms-search__autoSuggest__category',
            suggestions: undefined,
            searchRefiners: undefined,
            autoSuggestAriaLabel: '',
            isInitialState: true,
            isLoadingAutoSuggest: false
        };
        this.maxChars =
            (this.props.context &&
                this.props.context.app &&
                this.props.context.app.config &&
                this.props.context.app.config.searchInputMaxLength) ||
            50;

        this.inputSuggestionType = [];
        this.topResultsCount = this.props.config && this.props.config.topResultsCount ? this.props.config.topResultsCount : 5;
        this.searchFormClass = 'ms-search__form';
        this.searchLabelClass = 'ms-search__label';
        this.telemetryContent = getTelemetryObject(
            this.props.context.request.telemetryPageName!,
            this.props.friendlyName,
            this.props.telemetry
        );

        this._initSuggestionTypes();
    }

    public async componentDidMount(): Promise<void> {
        document.body && document.body.addEventListener('mousedown', this._focusOutTarget);
        window && window.addEventListener('keyup', this._keyup);
    }

    public componentWillUnmount(): void {
        document.body && document.body.removeEventListener('mousedown', this._focusOutTarget, false);
        window && window.removeEventListener('keyup', this._keyup, false);
    }

    public componentDidUpdate(): void {
        const {
            config: { hideSearchLabel }
        } = this.props;
        const { isSearchFormExpanded, isInitialState } = this.state;

        if (!this.props.context.request.params.isEditor) {
            if (!hideSearchLabel && isSearchFormExpanded) {
                this.searchTextInput && this.searchTextInput.current && this.searchTextInput.current.focus();
            } else if (!isInitialState) {
                this.searchCollapsedLabel && this.searchCollapsedLabel.current && this.searchCollapsedLabel.current.focus();
            }
        }
    }

    public shouldComponentUpdate(nextProps: ICustomSearchProps<ICustomSearchData>, nextState: ISearchState): boolean {
        if (this.state === nextState && this.props === nextProps) {
            return false;
        }
        return true;
    }

    // eslint-disable-next-line complexity -- ignore complexity.
    public render(): JSX.Element {
        const {
            context,
            resources: { searchtext, searchLabelArialLabel, cancelBtnAriaLabel, searchBtnAriaLabel, submitBtnAriaLabel },
            config: { hideSearchLabel, disableSubmitSearch, searchplaceholderText, shouldShowFullCategoryPath, className = '' }
        } = this.props;

        const {
            isSearchFormExpanded,
            searchText,
            searchKeywordSuggestClass,
            searchProductSuggestClass,
            searchCategorySuggestClass,
            suggestions,
            searchRefiners,
            isLoadingAutoSuggest
        } = this.state;

        const searchQsp = (context && context.app && context.app.config && context.app.config.searchQueryStringParameter) || 'q';
        const searchPageURL = getUrlSync('search', context && context.actionContext) || '';
        const searchURL = this._appendQueryParams(searchPageURL, searchText, searchQsp);
        const searchPlaceholder = searchplaceholderText && searchplaceholderText.length > 0 ? searchplaceholderText : 'Search in Fabrikam';

        const keywordSuggestions = suggestions?.AllSearchResults?.filter(
            suggestion => suggestion.SuggestionType === SuggestionType.Keyword || suggestion.SuggestionType === SuggestionType.None
        );
        const productSuggestions = suggestions?.AllSearchResults?.filter(
            suggestion => suggestion.SuggestionType === SuggestionType.Product
        );
        const categoryRefiners = searchRefiners?.find(refiner => {
            return refiner.SourceValue === ProductRefinerSource.Category;
        });
        const categorySuggestions = suggestions?.AllSearchResults?.filter(suggestion => {
            if (suggestion.SuggestionType !== SuggestionType.Category) {
                return false;
            }
            const refiner = categoryRefiners?.Values?.find(item => {
                return `${item.RefinerRecordId ?? 0}` === suggestion.Id;
            });

            return !ObjectExtensions.isNullOrUndefined(refiner);
        });

        const viewProps: ISearchViewProps = {
            ...(this.props as ICustomSearchProps<ICustomSearchData>),

            Search: {
                moduleProps: this.props,
                className: `${classnames('ms-search', className)} ${disableSubmitSearch ? 'no-submit' : 'with-submit'}`
            },
            AutoSuggestAriaLabel: {
                tag: 'div',
                className: 'msc-autoSuggest__screen-reader',
                'aria-live': 'assertive',
                ref: this.autoSuggestResultScreenReaderDiv
            },
            AutoSuggestAriaLabelText: this.state.autoSuggestAriaLabel,
            searchText: this.state.searchText,
            AutoSuggest: {
                ref: this.autoSuggestResultDiv,
                className: 'ms-search__autoSuggest'
            },
            KeywordSuggest: {
                className: searchKeywordSuggestClass
            },
            ProductSuggest: {
                className: searchProductSuggestClass
            },
            CategorySuggest: {
                className: searchCategorySuggestClass
            },
            SearchForm: {
                className: `${this.searchFormClass} ${isSearchFormExpanded ? 'bx-show' : 'bx-hide'}`
            },
            FormWrapper: {
                tag: 'form',
                ref: this.formReference,
                className: 'ms-search__searchForm',
                'aria-label': 'Search',
                name: 'searchForm',
                role: 'search',
                action: searchURL,
                autoComplete: 'off',
                onSubmit: this._handleSubmit
            },
            UlKeyword: {
                tag: 'ul',
                className: classnames('msc-autoSuggest__keywordResults-items', className)
            },
            UlProduct: {
                tag: 'ul',
                className: classnames('msc-autoSuggest__productResults-items', className)
            },
            UlCategory: {
                tag: 'ul',
                className: classnames('msc-autoSuggest__categoryResults-items', className)
            },
            label: LabelComponent({
                isSearchFormExpanded,
                searchLabelClass: `${this.searchLabelClass} ${isSearchFormExpanded ? 'bx-hide' : 'bx-show'}`,
                searchtext,
                searchLabelArialLabel,
                searchCollapsedLabel: this.searchCollapsedLabel,
                hideSearchLabel,
                handleCancelSearchChange: this._handleCancelSearchChange,
                telemetryContent: this.telemetryContent
            }),
            form: FormComponent({
                ariaLabelCancel: cancelBtnAriaLabel,
                ariaLabelSearch: searchBtnAriaLabel,
                ariaLabelSubmit: submitBtnAriaLabel,
                hideSearchLabel,
                searchTextInput: this.searchTextInput,
                disableSubmitSearch,
                handleInputChange: this._handleInputChange,
                handleCancelSearchChange: this._handleCancelSearchChange,
                maxChars: this.maxChars,
                searchQsp,
                searchPlaceholder,
                query: searchText
            }),
            autosuggestKeyword:
                searchText &&
                searchText.length > 0 &&
                (isLoadingAutoSuggest || (keywordSuggestions && ArrayExtensions.hasElements(keywordSuggestions)))
                    ? KeywordSuggestionsComponent({
                          searchKeywordSuggestClass,
                          searchPageURL,
                          searchQsp,
                          hitPrefix: this.hitPrefix,
                          hitSuffix: this.hitSuffix,
                          autoSuggestProps: this.props,
                          searchText,
                          suggestions: keywordSuggestions,
                          telemetryContent: this.telemetryContent
                      })
                    : undefined,
            autosuggestProduct:
                searchText &&
                searchText.length > 0 &&
                (isLoadingAutoSuggest || (productSuggestions && ArrayExtensions.hasElements(productSuggestions)))
                    ? ProductSuggestionsComponent({
                          searchProductSuggestClass,
                          searchPageURL,
                          searchQsp,
                          hitPrefix: this.hitPrefix,
                          hitSuffix: this.hitSuffix,
                          autoSuggestProps: this.props,
                          searchText,
                          suggestions: productSuggestions,
                          telemetry: this.props.telemetry,
                          moduleType: this.props.typeName,
                          moduleId: this.props.id,
                          telemetryContent: this.telemetryContent,
                          resources: this.props.resources
                      })
                    : undefined,
            autosuggestCategory:
                searchText &&
                searchText.length > 0 &&
                (isLoadingAutoSuggest || (categorySuggestions && ArrayExtensions.hasElements(categorySuggestions)))
                    ? CategorySuggestionsComponent({
                          searchCategorySuggestClass,
                          searchPageURL,
                          searchQsp,
                          hitPrefix: this.hitPrefix,
                          hitSuffix: this.hitSuffix,
                          autoSuggestProps: this.props,
                          searchText,
                          suggestions: categorySuggestions,
                          searchRefiners,
                          telemetryContent: this.telemetryContent,
                          shouldShowFullPath: shouldShowFullCategoryPath
                      })
                    : undefined,
            callbacks: {
                handleCancelSearchChange: this._handleCancelSearchChange,
                handleCancelSearchFocused: this._handleCancelSearchFocused
            },
            isSearchFormExpanded: this.state.isSearchFormExpanded,
            isLoadingAutoSuggest,
            isLoadingNode: this._isLoadingNode()
        };

        return this.props.renderView(viewProps) as React.ReactElement;
    }

    private _initSuggestionTypes() {
        const suggestionTypes = this.props.config.suggestionTypeCriterion;

        const suggestions = ArrayExtensions.unique(ArrayExtensions.validValues(suggestionTypes));
        if (!ArrayExtensions.hasElements(suggestions)) {
            this.inputSuggestionType = [
                { SuggestionType: SuggestionTypeCriterionSuggestionType.keyword },
                { SuggestionType: SuggestionTypeCriterionSuggestionType.product },
                { SuggestionType: SuggestionTypeCriterionSuggestionType.scopedCategory }
            ];
            return;
        }

        const validSuggestions = suggestions.filter(suggestion => suggestion.SuggestionType);
        if (ArrayExtensions.hasElements(validSuggestions)) {
            this.inputSuggestionType = validSuggestions;
            return;
        }

        this.inputSuggestionType = [];
    }

    /**
     * Function to create the ReactNode for loading Autosuggest result.
     * @returns ReachNode for loading Autosuggest result.
     */
    private readonly _isLoadingNode = (): React.ReactNode => {
        const loadingText = this.props.resources.autoSuggestResultLoadingMessage;
        return <Spinner className='msc-autoSuggest__loadingResult' label={loadingText} size={SpinnerSize.medium} labelPosition='right' />;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly _focusOutTarget = (e: any): void => {
        const { suggestions } = this.state;

        if (suggestions && suggestions.AllSearchResults && e.target.closest('.ms-search') === null) {
            this._clearAutoSuggestState();
        }
    };

    private readonly _keyup = (e: KeyboardEvent): void => {
        const { suggestions } = this.state;

        if (suggestions && suggestions.AllSearchResults && e.keyCode === KeyCodes.Escape) {
            this._clearAutoSuggestState();
        } else if (this.state.isSearchFormExpanded && e.keyCode === KeyCodes.Escape) {
            if (this.state.isSearchFormExpanded) {
                this.setState({ isSearchFormExpanded: false });
            }
        }

        if (
            !(
                (this.formReference.current && this.formReference.current.contains((e.target as unknown) as Node)) ||
                (this.autoSuggestResultDiv.current && this.autoSuggestResultDiv.current.contains((e.target as unknown) as Node))
            )
        ) {
            if (suggestions && suggestions.AllSearchResults) {
                this._clearAutoSuggestState();
            }

            if (this.state.isSearchFormExpanded) {
                this.setState({ isSearchFormExpanded: false });
            }
        }
    };

    private readonly _clearAutoSuggestState = (): void => {
        const {
            context: { actionContext },
            data: { searchState }
        } = this.props;

        if (this.searchTextInput.current && this.searchTextInput.current.value.length > 0) {
            searchState.searchText = '';
            searchState.defaultBasicSearchUrl = '';
            searchState.searchQueryStringParameter = '';
            actionContext ? actionContext.update(createSearchStateInput(searchState), searchState) : null;
            this.searchTextInput.current.value = '';
        }

        this.setState({ searchText: '', suggestions: undefined, searchRefiners: undefined });
    };

    private async _getSearchSuggestions(loadSuggestionsRequestId: string, query: string) {
        try {
            const searchSuggestions = await getSearchSuggestionsAction(
                new AutoSuggestInput(query, this.topResultsCount, this._getSuggestionType(), this.hitPrefix, this.hitSuffix),
                this.props.context.actionContext
            );
            if (loadSuggestionsRequestId !== this.loadSuggestionsRequestId) {
                return undefined;
            }
            return searchSuggestions;
        } catch (error) {
            if (loadSuggestionsRequestId !== this.loadSuggestionsRequestId) {
                return undefined;
            }
            this.setState({ suggestions: undefined, searchRefiners: undefined, autoSuggestAriaLabel: this._setAutoSuggestResultCount() });
            if (error instanceof Error) {
                if (error instanceof Error) {
                    this.props.telemetry.exception(error instanceof Error ? error : new Error(String(error)));
                } else {
                    this.props.telemetry.exception(new Error(String(error)));
                }
            } else {
                this.props.telemetry.exception(new Error(String(error)));
            }
            this.props.telemetry.debug('Unable to get auto suggest results');
            return undefined;
        }
    }

    private async _updateSearchRefiners(loadSuggestionsRequestId: string, query: string, suggestions: Autosuggestions | undefined) {
        try {
            const refiners = await this._getSearchRefiners(query);
            if (loadSuggestionsRequestId !== this.loadSuggestionsRequestId) {
                return;
            }
            this.setState({
                suggestions,
                searchRefiners: refiners,
                autoSuggestAriaLabel: this._setAutoSuggestResultCount(suggestions),
                isLoadingAutoSuggest: false
            });
        } catch (error) {
            if (loadSuggestionsRequestId !== this.loadSuggestionsRequestId) {
                return;
            }
            this.setState({ suggestions, searchRefiners: undefined, autoSuggestAriaLabel: this._setAutoSuggestResultCount(suggestions) });
            this.props.telemetry.exception(error instanceof Error ? error : new Error(String(error)));
            this.props.telemetry.debug('Unable to get refiners results');
        }
    }

    private _loadSuggestions(query: string) {
        this.cancellabelDebounce = debounce(async () => {
            this.setState({ isLoadingAutoSuggest: true });
            const loadSuggestionsRequestId = Random.Guid.generateGuid();
            this.loadSuggestionsRequestId = loadSuggestionsRequestId;
            const searchSuggestions = await this._getSearchSuggestions(loadSuggestionsRequestId, query);
            await this._updateSearchRefiners(loadSuggestionsRequestId, query, searchSuggestions);
        }, this.waitTime);

        setTimeout(() => {
            this.cancellabelDebounce();
        }, 0);
    }

    private readonly _handleInputChange = (query: string): void => {
        if (!query || query.length <= this.maxChars) {
            this.setState({ searchText: query });
        }

        if (this.cancellabelDebounce) {
            this.cancellabelDebounce.cancel();
        }

        const {
            context,
            data: { searchState }
        } = this.props;

        if (context) {
            if (query && query.length > 0) {
                if (query.length > this.maxChars) {
                    return;
                }

                if (ArrayExtensions.hasElements(this.inputSuggestionType)) {
                    this._loadSuggestions(query);
                }

                searchState.searchText = query;
            } else {
                this.setState({ suggestions: undefined, searchRefiners: undefined });
                searchState.searchText = '';
            }
            context.actionContext.update(createSearchStateInput(searchState), searchState);
        }
    };

    private _getSuggestionType(): string {
        const distinctSuggestionTypes: string[] = this.inputSuggestionType.map(
            suggestionTypeItem => suggestionTypeItem.SuggestionType!.charAt(0).toUpperCase() + suggestionTypeItem.SuggestionType!.slice(1)
        );
        return distinctSuggestionTypes.join(',');
    }

    private async _getSearchRefiners(searchText: string): Promise<ProductRefiner[]> {
        const { actionContext: ctx } = this.props.context;
        const catalogId = getCatalogId(ctx.requestContext);
        validateCatalogId(catalogId);
        return ProductsDataActions.getProductSearchRefinersAsync(
            { callerContext: ctx },
            {
                SearchCondition: searchText,
                Context: {
                    ChannelId: +ctx.requestContext.apiSettings.channelId,
                    CatalogId: catalogId
                }
            }
        );
    }

    private readonly _handleSubmit = (
        e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement> | React.FormEvent<HTMLFormElement>
    ): void => {
        const {
            config: { disableSubmitSearch },
            context: {
                actionContext,
                app: {
                    config: { searchQueryStringParameter }
                }
            }
        } = this.props;
        const query = this.searchTextInput.current && this.searchTextInput.current.value;
        console.log('query', query);
        e.preventDefault();

        if (!query || (query && query.length === 0) || disableSubmitSearch) {
            this.searchTextInput && this.searchTextInput.current && this.searchTextInput.current.focus();
        } else {
            const searchQsp = searchQueryStringParameter || 'q';
            const searchURL = this._appendQueryParams(getUrlSync('search', actionContext) || '', query, searchQsp);
            document.location.href = searchURL;
        }
    };

    private readonly _handleCancelSearchChange = (): void => {
        const { isSearchFormExpanded, suggestions } = this.state;

        if (!isSearchFormExpanded) {
            this.setState({
                isSearchFormExpanded: true,
                searchText: '',
                isInitialState: false
            });
        } else {
            if (suggestions && suggestions.AllSearchResults) {
                this._clearAutoSuggestState();
            }
            this.setState({ isSearchFormExpanded: false });
        }
    };

    private readonly _handleCancelSearchFocused = (): void => {
        const { suggestions } = this.state;
        if (!(suggestions && suggestions.AllSearchResults)) {
            this._clearAutoSuggestState();
            this.setState({ isSearchFormExpanded: false });
        }
    };

    private readonly _appendQueryParams = (route: string, query: string, qsp: string): string => {
        if (!MsDyn365.isBrowser) {
            return '';
        }

        const queryUrl = new URL(route, window.location.href);
        if (qsp && query) {
            queryUrl.searchParams.set(qsp, query);
        }

        return queryUrl.href;
    };

    private readonly _setAutoSuggestResultCount = (result?: Autosuggestions) => {
        if (this.autoSuggestResultScreenReaderDiv.current !== null) {
            const ariaLiveRegion = this.autoSuggestResultScreenReaderDiv.current;
            const suggestResultString = this.props.resources.autoSuggestFoundMessage;
            const emptyResultString = this.props.resources.noAutoSuggestionMessage;
            ariaLiveRegion.innerText =
                result && result.AllSearchResults && result.AllSearchResults.length > 0 ? suggestResultString : emptyResultString;
            ariaLiveRegion.setAttribute('aria-live', 'assertive');
            return ariaLiveRegion.innerText;
        }
        return '';
    };
}

export default Search;
