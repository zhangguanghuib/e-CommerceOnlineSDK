import { createObservableDataAction } from '@msdyn365-commerce/action-internal';
import { getCatalogIdForSdk, IAction, IActionContext } from '@msdyn365-commerce/core-internal';
import { searchByCriteriaAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';
import { ProductSearchCriteria, ProductSearchResult } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { ICookieContext } from '@msdyn365-commerce/core';
import { RecentlyViewedProductItem } from '@msdyn365-commerce-modules/buybox/src/modules/recently-viewed/base';
import { getProductImageUrls, ProductListInput } from '../actions/hydrate';

export const getProductsByRecentlyViewedList = async (input: ProductListInput, context: IActionContext): Promise<ProductSearchResult[]> => {
    console.log('getProductsByRecentlyViewedList - from customizatin by GHZ');
    const searchCriteriaInput: ProductSearchCriteria = {};
    const cookieContext: ICookieContext = context.requestContext.cookies;
    const catalogId = getCatalogIdForSdk(context.requestContext, null);
    searchCriteriaInput.Context = {
        ChannelId: context.requestContext.apiSettings.channelId,
        CatalogId: catalogId
    };
    searchCriteriaInput.IncludeAttributes = false;
    searchCriteriaInput.SkipVariantExpansion = true;
    const cookieName: string = '_msdyn365__recently_viewed_products';
    const cookieValue = cookieContext.get<RecentlyViewedProductItem[] | undefined | null>(cookieName).value;
    const productIds = cookieValue?.filter(value => value.catalogId === catalogId).map(value => value.productId) || [0];
    searchCriteriaInput.Ids = productIds;

    return searchByCriteriaAsync(
        { callerContext: context, queryResultSettings: { Paging: { Top: input.listMetadata.pageSize || 10 } } },
        searchCriteriaInput
    )
        .then((products: ProductSearchResult[]) => {
            products.map(pro => {
                pro.Name = `Recently Viewed Product: ${pro.Name}`;
            });
            context.telemetry.debug('Products returned by RecentlyViewed action', products);
            return getProductImageUrls(products, context.requestContext.apiSettings);
        })
        .catch(error => {
            context.telemetry.error(`Error in RecentlyViewed action: ${error}}`);
            throw new Error(error);
        });
};

export const getProductsByRecentlyViewedListAction = createObservableDataAction({
    action: <IAction<ProductSearchResult[]>>getProductsByRecentlyViewedList,
    id: '@msdyn365-commerce/products-by-recentlyviewed'
});
