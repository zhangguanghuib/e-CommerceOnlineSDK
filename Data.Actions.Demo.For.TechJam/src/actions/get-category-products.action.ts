/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as Msdyn365 from '@msdyn365-commerce/core';
import { IQueryResultSettings, ProductSearchCriteria, ProductSearchResult } from '@msdyn365-commerce/retail-proxy';
import { buildCacheKey, QueryResultSettingsProxy } from '@msdyn365-commerce-modules/retail-actions';
import { searchByCriteriaAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';

/**
 * GetCategoryProducts Input Action
 */
export class GetCategoryProductsInput implements Msdyn365.IActionInput {
    public categoryId: number;
    public itemsPerPage: number;
    public queryResultSettings: IQueryResultSettings;
    private readonly apiSettings: Msdyn365.ICommerceApiSettings;
    // TODO: Construct the input needed to run the action
    public constructor(
        categoryId: number,
        itemsPerPage: number,
        queryResultSettings: IQueryResultSettings,
        apiSettings: Msdyn365.ICommerceApiSettings
    ) {
        this.categoryId = categoryId;
        this.itemsPerPage = itemsPerPage;
        this.queryResultSettings = queryResultSettings;
        this.apiSettings = apiSettings;
    }

    // TODO: Determine if the results of this get action should cache the results and if so provide
    // a cache object type and an appropriate cache key
    public getCacheKey = () => buildCacheKey(`Category-${this.categoryId}`, this.apiSettings);
    public getCacheObjectType = () => 'CategoryProducts';
    public dataCacheType = (): Msdyn365.CacheType => 'request';
}

// TODO: Create a data model here or import one to capture the response of the action
export interface IGetCategoryProductsData {
    text: string;
}

/**
 * TODO: Use this function to create the input required to make the action call
 */
const createInput = (args: Msdyn365.ICreateActionContext<{ categoryId: number; itemsPerPage: number }>): Msdyn365.IActionInput => {
    const queryResultSettings = QueryResultSettingsProxy.fromInputData(args).QueryResultSettings;
    return new GetCategoryProductsInput(
        args.config?.categoryId || 0,
        args.config?.itemsPerPage || 0,
        queryResultSettings,
        args.requestContext.apiSettings
    );
};

export async function getCategoryProducts(input: GetCategoryProductsInput, ctx: Msdyn365.IActionContext): Promise<ProductSearchResult[]> {
    const searchCriteriaInput: ProductSearchCriteria = {};
    searchCriteriaInput.Context = { ChannelId: ctx.requestContext.apiSettings.channelId, CatalogId: 0 };
    searchCriteriaInput.CategoryIds = [input.categoryId || 0];

    // Set Top
    if (input.queryResultSettings.Paging && input.itemsPerPage) {
        input.queryResultSettings.Paging.Top = input.itemsPerPage || 1;
    }

    // Set Skip
    if (input.queryResultSettings.Paging && ctx.requestContext.query && ctx.requestContext.query.Skip) {
        input.queryResultSettings.Paging.Skip = +ctx.requestContext.query.Skip;
    }

    const result: ProductSearchResult[] = await searchByCriteriaAsync(
        {
            callerContext: ctx,
            queryResultSettings: input.queryResultSettings
        },
        searchCriteriaInput
    );
    return result;
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<ProductSearchResult[]>>getCategoryProducts,
    id: 'GetCategoryProducts',
    input: createInput
});
