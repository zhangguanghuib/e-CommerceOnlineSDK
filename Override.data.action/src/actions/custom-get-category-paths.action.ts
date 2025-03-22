/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */
import { CacheType, IActionInput, getCatalogId } from '@msdyn365-commerce/core';
import * as Msdyn365 from '@msdyn365-commerce/core';

import { ICategoryPath, ICategoryUrl } from '@msdyn365-commerce/core-internal/dist/types/interfaces/ICategoryPathInterfaces';
import { getCategoryPathsAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';
import { CategoryPathLookup } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { buildCacheKey, getSelectedProductIdFromActionInput, QueryResultSettingsProxy } from '@msdyn365-commerce-modules/retail-actions';

export class GetCategoryPathsInput implements IActionInput {
    public readonly ChannelId: number;
    public readonly CatalogId: number;
    public readonly categoryPathLooksups: CategoryPathLookup[];
    public readonly apiSettings: Msdyn365.ICommerceApiSettings;
    private readonly locale: string;
    private constructedCacheKey: string;

    public constructor(context: Msdyn365.IRequestContext, categoryPathLookups: CategoryPathLookup[]) {
        this.ChannelId = context.apiSettings.channelId;
        this.CatalogId = getCatalogId(context);
        this.categoryPathLooksups = categoryPathLookups;
        this.apiSettings = context.apiSettings;
        this.constructedCacheKey = '';
        categoryPathLookups.forEach((categoryPath: CategoryPathLookup) => {
            this.constructedCacheKey += `${categoryPath.ProductId && categoryPath.ProductId.toString()}|`;
        });
        this.constructedCacheKey += `${this.ChannelId.toString()}|`;
        this.constructedCacheKey += `${this.CatalogId.toString()}|`;
        this.locale = context.locale;
    }

    public getCacheKey = () => buildCacheKey(this.constructedCacheKey, this.apiSettings, this.locale);
    public getCacheObjectType = () => 'CategoryPath';

    public dataCacheType = (): CacheType => 'request';

    public getLocale = (): string => this.locale;
}

export const createGetCategoryPathsInput = (inputData: Msdyn365.ICreateActionContext<Msdyn365.IGeneric<Msdyn365.IAny>>): IActionInput => {
    const productId = getSelectedProductIdFromActionInput(inputData);
    if (productId) {
        return new GetCategoryPathsInput(inputData.requestContext, [{ ProductId: +productId }]);
    }
    throw new Error('Unable to create SelectedVariantInput, no productId found on module config or query');
};

export async function getCategoryPathsAction(input: GetCategoryPathsInput, ctx: Msdyn365.IActionContext): Promise<ICategoryUrl[]> {
    const categoryPathResults = await getCategoryPathsAsync(
        {
            callerContext: ctx,
            queryResultSettings: QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx)
        },
        input.ChannelId,
        input.CatalogId,
        input.categoryPathLooksups
    );

    const categoryPath = categoryPathResults[0].CategoryPath && categoryPathResults[0].CategoryPath[0];
    const categoryUrl = Msdyn365.getCategoriesUrlSync(<ICategoryPath>categoryPath, ctx);
    if (categoryUrl) {
        const defaultCategory: ICategoryUrl = { Name: 'Custom path', Url: '/home' };
        categoryUrl.push(defaultCategory);
        return categoryUrl.slice(1);
    }
    return [];
}

export const getCategoryPathsActionDataAction = Msdyn365.createObservableDataAction({
    id: '@msdyn365-commerce-modules/retail-actions/get-category-paths',
    action: <Msdyn365.IAction<ICategoryUrl[]>>getCategoryPathsAction,
    input: createGetCategoryPathsInput
});

export default getCategoryPathsActionDataAction;
