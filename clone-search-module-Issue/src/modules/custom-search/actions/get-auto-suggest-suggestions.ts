/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

/* eslint-disable no-duplicate-imports */
import { Autosuggestions } from '@msdyn365-commerce/commerce-entities';
import {
    CacheType,
    createObservableDataAction,
    getCatalogId,
    IAction,
    IActionContext,
    IActionInput,
    ICreateActionContext
} from '@msdyn365-commerce/core';
import {
    AttributeDataType,
    ChannelInventoryConfiguration,
    ProductRefinerSource,
    ProductRefinerValue,
    ProductSearchCriteria,
    SearchSuggestion,
    SearchSuggestionCriteria
} from '@msdyn365-commerce/retail-proxy';
import {
    getInventoryConfigurationAsync,
    getSearchSuggestionsAsync
} from '@msdyn365-commerce/retail-proxy/dist/DataActions/StoreOperationsDataActions.g';
import { generateImageUrl } from '@msdyn365-commerce-modules/retail-actions';

export enum SuggestionType {
    Category = 'ScopedCategory',
    Keyword = 'Keyword',
    Product = 'Product',
    None = 'None'
}

/**
 * This setting defines inventory filtering options.
 */
export enum ProductListInventoryFilteringOptions {
    /**
     * Filter out all products out of stock.
     */
    HideOOS = 'hideOOS',

    /**
     * Sort products by availability, OOS goes last.
     */
    SortOOS = 'sortOOS',

    /**
     * No filtering selected.
     */
    Default = 'default'
}

/**
 * Input class for auto suggest search input.
 */
export class AutoSuggestInput implements IActionInput {
    public searchQuery?: string;

    public topResultsCount?: number;

    public suggestionType?: string;

    public hitPrefix?: string;

    public hitSuffix?: string;

    public constructor(searchText?: string, top?: number, suggestionType?: string, hitPrefix?: string, hitSuffix?: string) {
        this.searchQuery = searchText;
        this.topResultsCount = top;
        this.suggestionType = suggestionType;
        this.hitPrefix = hitPrefix;
        this.hitSuffix = hitSuffix;
    }

    public getCacheKey = () => 'AutoSuggestSearchSuggestions';

    public getCacheObjectType = () => 'AutoSuggestSearchSuggestions';

    public dataCacheType = (): CacheType => 'none';
}

const createInput = (inputData: ICreateActionContext) => {
    return new AutoSuggestInput();
};

/**
 * Calls the Retail API and returns a auto-suggest suggestions.
 * @param input
 * @param ctx
 */
export async function getSearchSuggestionsAction(input: AutoSuggestInput, ctx: IActionContext): Promise<Autosuggestions | null> {
    // If no input is provided fail out
    if (!input || !input.searchQuery) {
        throw new Error('[getSearchSuggestionsAction]No valid Input was provided, failing');
    }

    const autosuggest: Autosuggestions = {};

    const autoSuggestPromises = [_getAutoSuggest(input, autosuggest, ctx)];
    return Promise.all(autoSuggestPromises).then(() => {
        return autosuggest;
    });
}

/**
 * Returns inventory in stock sortable refiner value.
 * @param  channelInventoryConfiguration - The channelInventoryConfiguration.
 * @param  isInStock - The flag indicating whether is getting in-stock refiner or out-of-stock refiner.
 * @returns Refiners.
 */
const getInventorySortableRefinerValue = (
    channelInventoryConfiguration: ChannelInventoryConfiguration,
    isInStock: boolean
): ProductRefinerValue | undefined => {
    if (channelInventoryConfiguration && channelInventoryConfiguration.ProductAvailabilitySortableAttributeRecordId) {
        return {
            RefinerRecordId: channelInventoryConfiguration.ProductAvailabilitySortableAttributeRecordId,
            DataTypeValue: AttributeDataType.TrueFalse,
            LeftValueBoundString: isInStock ? 'true' : 'false',
            RightValueBoundString: isInStock ? 'true' : 'false',
            UnitText: '',
            RowNumber: 0,
            Count: 0,
            ExtensionProperties: [],
            RefinerSourceValue: ProductRefinerSource.Attribute
        };
    }
    return undefined;
};

async function _getAutoSuggest(input: AutoSuggestInput, autosuggest: Autosuggestions, ctx: IActionContext): Promise<void> {
    const catalogId = getCatalogId(ctx.requestContext);
    let productSearchCriteria: ProductSearchCriteria = {
        SearchCondition: input.searchQuery && input.searchQuery.length > 0 ? input.searchQuery : '',
        Context: {
            ChannelId: +ctx.requestContext.apiSettings.channelId,
            CatalogId: catalogId
        }
    };

    if (ctx.requestContext.app.config?.productListInventoryDisplay === ProductListInventoryFilteringOptions.HideOOS) {
        const channelInventoryConfiguration = await getInventoryConfigurationAsync({ callerContext: ctx });
        const isInStockRefiner = true;
        const inventoryRefinerValue = getInventorySortableRefinerValue(channelInventoryConfiguration, isInStockRefiner);

        if (inventoryRefinerValue) {
            productSearchCriteria = {
                ...productSearchCriteria,
                Refinement: [inventoryRefinerValue]
            };
        }
    }

    const searchCriteria: SearchSuggestionCriteria = {
        ProductSearchCriteria: productSearchCriteria,
        HitPrefix: input.hitPrefix,
        HitSuffix: input.hitSuffix,
        SuggestionType: input.suggestionType
    };

    const searchSuggestions = await getSearchSuggestionsAsync(
        { callerContext: ctx, queryResultSettings: { Paging: { Top: input.topResultsCount } } },
        searchCriteria
    );

    if (searchSuggestions && searchSuggestions.length > 0) {
        // Generate image url
        searchSuggestions.map(
            (item: SearchSuggestion) =>
                (item.ImageUrl = item.ImageUrl ? generateImageUrl(item.ImageUrl, ctx.requestContext.apiSettings) : '')
        );

        autosuggest.AllSearchResults = searchSuggestions;
    } else {
        ctx.telemetry.error(
            `[getSearchSuggestionsAction] unable to get availabilites for search with suggestion type ${searchCriteria.SuggestionType}`
        );
    }
}

export const getSearchSuggestionsActionDataAction = createObservableDataAction({
    id: '@msdyn365-commerce-modules/search/get-auto-suggest-suggestions',
    action: <IAction<Autosuggestions>>getSearchSuggestionsAction,
    input: createInput
});

export default getSearchSuggestionsActionDataAction;
