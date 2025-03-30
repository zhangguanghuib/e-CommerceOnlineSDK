import { createObservableDataAction } from '@msdyn365-commerce/action-internal';
import { getCatalogIdForSdk, IAction, IActionContext, versionGte } from '@msdyn365-commerce/core-internal';

import { IContext } from '@msdyn365-commerce/retail-proxy';

import { readAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/CartsDataActions.g';
import { searchByCriteriaAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';
import { getElementsAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/RecommendationsDataActions.g';

import {
    Cart,
    ProductSearchCriteria,
    ProductSearchResult,
    RecommendationCriteria,
    RecommendedElement
} from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';

import { ProductInput } from '@msdyn365-commerce-modules/retail-actions';
import { getProductImageUrls, ProductListInput } from '../actions/hydrate';

const actionInputError = (missingType: string) => {
    throw new Error(`Input ${missingType} is missing and required to run GetProductsByRelationshipId action.`);
};

const enum CartTokenPrefix {
    Auth = 't',
    Anon = 'p'
}

const getCategoryIdForReco = (recommendationCriteria: RecommendationCriteria, input: ProductListInput, context: IActionContext) => {
    let categoryIds: number[] = [];

    if (input.listMetadata.includePageContext || !input.listMetadata.categoryIds || input.listMetadata.categoryIds.length === 0) {
        const urlTokens = context.requestContext.urlTokens;

        if (urlTokens && urlTokens.pageType && urlTokens.pageType.toLowerCase() === 'category') {
            if (urlTokens.recordId) {
                categoryIds = [+urlTokens.recordId];
            }
        }
    } else {
        if (input.listMetadata.categoryIds && input.listMetadata.categoryIds.length > 0) {
            categoryIds = input.listMetadata.categoryIds;
        }
    }
    recommendationCriteria.CategoryIds = categoryIds;
};

const getCart = async (ctx: IActionContext): Promise<Cart | undefined> => {
    let cart;
    if (ctx.requestContext && ctx.requestContext.cookies) {
        const cookies = ctx.requestContext && ctx.requestContext.cookies;
        const cartCookie = cookies.getCartCookie();
        const cartCookieParts = cartCookie.split(':');
        if (cartCookieParts && cartCookieParts.length === 2) {
            if (
                (ctx.requestContext.user.isAuthenticated && cartCookieParts[0] === CartTokenPrefix.Auth) ||
                (!ctx.requestContext.user.isAuthenticated && cartCookieParts[0] === CartTokenPrefix.Anon)
            ) {
                const readCart = await readAsync({ callerContext: ctx }, cartCookieParts[1]);
                if (readCart && readCart.Id) {
                    cart = readCart;
                }
            }
        }
    }
    return cart;
};

const getProductIdForReco = async (recommendationCriteria: RecommendationCriteria, input: ProductListInput, context: IActionContext) => {
    let productIds: number[] = [];
    if (input.listMetadata.includeCart) {
        const cart = await getCart(context);
        if (cart && cart.CartLines) {
            const validCartLines = cart.CartLines.filter(cartLine => cartLine.ProductId !== undefined);
            const cartProductIds = validCartLines.map(cartline => cartline.ProductId);
            context.telemetry.debug(`Products in cart: ${cartProductIds}`);
            if (cartProductIds && cartProductIds.length > 0) {
                productIds = <any>cartProductIds;
            }
        }
    } else if (input.listMetadata.includePageContext || !input.listMetadata.productIds || input.listMetadata.productIds.length > 0) {
        const urlTokens = context.requestContext.urlTokens;
        if (urlTokens && urlTokens.recordId && urlTokens.pageType && urlTokens.pageType.toLowerCase() === 'product') {
            productIds = [+urlTokens.recordId];
        }
    } else {
        if (input.listMetadata.productIds && input.listMetadata.productIds.length > 0) {
            productIds = [input.listMetadata.productIds[0]];
        }
    }

    return productIds;
};

const getProductsByNewSearchByCriteria = async (input: ProductListInput, callerContext: IContext): Promise<ProductSearchResult[]> => {
    const context = <IActionContext>callerContext.callerContext;
    const customerAccountNumber =
        context.requestContext && context.requestContext.user && context.requestContext.user.customerAccountNumber;
    const searchCriteria: ProductSearchCriteria = {
        CustomerAccountNumber: customerAccountNumber,
        RecommendationListId: input.listMetadata.recommendationListId,
        Context: {
            ChannelId: +context.requestContext.apiSettings.channelId,
            CatalogId: +input.catalogId
        },
        IncludeAttributes: true,
        SkipVariantExpansion: true
    };
    const rsVersion =
        !process.env.MSDYN365_COMMERCE_RS_VERSION || process.env.MSDYN365_COMMERCE_RS_VERSION === '--'
            ? '0.0'
            : process.env.MSDYN365_COMMERCE_RS_VERSION;

    const sequentialCallForRecoProducts = versionGte(rsVersion, '9.24');
    if (sequentialCallForRecoProducts && !context.requestContext?.features?.disable_sequential_call_for_recoProducts) {
        try {
            getCategoryIdForReco(searchCriteria, input, context);
            searchCriteria.Ids = await getProductIdForReco(searchCriteria, input, context);
            let productSearchResults = await searchByCriteriaAsync(
                { callerContext: context, queryResultSettings: { Paging: { Top: input.listMetadata.pageSize || 10 } } },
                searchCriteria
            );
            productSearchResults.map(pro => {
                pro.Name = `${pro.Name} testing`;
            });

            if (productSearchResults && productSearchResults.length > 0) {
                let productSearchResultsTmp: ProductSearchResult[] = [];
                productSearchResultsTmp = productSearchResults.filter(item => {
                    const isVariantProduct = !item.IsMasterProduct && item.MasterProductId !== 0;
                    return !isVariantProduct;
                });

                productSearchResults = productSearchResultsTmp;
                if (productSearchResults.length > 0) {
                    productSearchResults.map(pro => {
                        pro.Name = `Recommended Product: ${pro.Name}`;
                    });
                    getProductImageUrls(productSearchResults, context.requestContext.apiSettings);
                    return productSearchResults;
                }
            }
        } catch (e) {
            context.telemetry.error(`Error in GetProductsByNewSearchByCriteria action: ${e}`);
        }
    }
    return [];
};

export const getProductsByRecommendationList = async (input: ProductListInput, context: IActionContext): Promise<ProductSearchResult[]> => {
    const customerAccountNumber =
        context.requestContext && context.requestContext.user && context.requestContext.user.customerAccountNumber;
    if (input.listMetadata.recommendationListId === 'picks' && !customerAccountNumber) {
        return [];
    }

    const recommendationCriteria: RecommendationCriteria = {};
    const proxyContext: IContext = { callerContext: context, queryResultSettings: { Paging: { Top: input.listMetadata.pageSize || 10 } } };
    recommendationCriteria.CatalogId = input.catalogId;

    let reccomendationListId;
    if (input.listMetadata.recommendationListId) {
        reccomendationListId = input.listMetadata.recommendationListId;
    } else {
        actionInputError(`recommendationListId (from listmeradata)`);
    }

    recommendationCriteria.ProductIds = await getProductIdForReco(recommendationCriteria, input, context);

    if ((input.listMetadata.personalization || reccomendationListId === 'picks') && customerAccountNumber) {
        recommendationCriteria.CustomerAccountNumber = customerAccountNumber;
        proxyContext.bypassCache = 'get';
    }

    const products = await getProductsByNewSearchByCriteria(input, proxyContext);
    if (products && products.length > 0) {
        return products;
    }

    context.telemetry.debug(`Recommendation Criteria: ${JSON.stringify(recommendationCriteria)}`);

    if (reccomendationListId) {
        return getElementsAsync(proxyContext, reccomendationListId, recommendationCriteria)
            .then(async (recommendedElements: RecommendedElement[]) => {
                if (recommendedElements) {
                    const productInputs: ProductInput[] = [];
                    const productTypeId: string[] = [];
                    const catalogIdNumber = getCatalogIdForSdk(context.requestContext, null);
                    // Grab all the elements that are products and store the product ids
                    for (let i = 0; i < recommendedElements.length; i++) {
                        // eslint-disable-next-line security/detect-object-injection
                        const element = recommendedElements[i];
                        // Element type value of 1 indicates product type
                        if (element.ElementId && element.ElementTypeValue === 1) {
                            // eslint-disable-next-line security/detect-object-injection
                            productInputs[i] = new ProductInput(+element.ElementId, context.requestContext.apiSettings, catalogIdNumber);
                            // eslint-disable-next-line security/detect-object-injection
                            productTypeId[i] = element.ElementId;
                        }
                    }
                    context.telemetry.debug(`Running recommendation action for list ${input.listMetadata.recommendationListId}`);
                    context.telemetry.debug(`Number of products returned: ${productTypeId.length}`);
                    context.telemetry.debug('Product ids returned', productTypeId);

                    if (productInputs.length) {
                        const itemIds: number[] = productInputs.map(value => value.productId);
                        const productSearchCriteria: ProductSearchCriteria = {
                            Ids: itemIds,
                            Context: {
                                ChannelId: +context.requestContext.apiSettings.channelId,
                                CatalogId: +input.catalogId
                            },
                            SkipVariantExpansion: true,
                            IncludeAttributes: true
                        };
                        try {
                            const productSearchResults = await searchByCriteriaAsync(
                                { callerContext: context, queryResultSettings: { Paging: { Top: input.listMetadata.pageSize || 10 } } },
                                productSearchCriteria
                            );
                            // If the ProductSearchResult API finds the products then populate the product image urls and return
                            // otherwise if the API does not exist or does not return products proceed to the legacy flows for legacy/backward compatibility reasons
                            context.telemetry.debug('Product search results returned', JSON.stringify(productSearchResults));
                            if (productSearchResults.length > 0) {
                                getProductImageUrls(productSearchResults, context.requestContext.apiSettings);
                                // productSearchResults = orderProductSearchResults(itemIds, productSearchResults);
                                return productSearchResults;
                            }
                        } catch (e) {
                            // In case of an error fall back to legacy flow
                            context.telemetry.error(`Error while getting productSearchResult: ${e}`);
                        }
                    }
                }
                return [];
            })
            .catch((error: any) => {
                context.telemetry.error(`Error running productByRecommendation action: ${error}`);
                throw new Error(error);
            });
    }
    return [];
};

export const getProductsByRecommendationListAction = createObservableDataAction({
    action: <IAction<ProductSearchResult[]>>getProductsByRecommendationList,
    id: '@msdyn365-commerce/products-by-recommendation'
});
