import * as Msdyn365 from '@msdyn365-commerce/core';
import {
    AffiliationLoyaltyTier,
    ProductPrice,
    ProjectionDomain,
    SimpleProduct
} from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import {
    ArrayExtensions,
    getSelectedProductIdFromActionInput,
    getSelectedVariant,
    QueryResultSettingsProxy,
    SelectedVariantInput
} from '@msdyn365-commerce-modules/retail-actions';
import { getCartFromCustomer } from '@msdyn365-commerce/global-state';
import { getActivePricesAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';

export class PriceForSelectedVariantInput implements Msdyn365.IActionInput {
    public productId: number;
    public channelId: number;
    public selectedProduct: SimpleProduct | undefined;
    public customerId?: string;

    public constructor(productId: number, channelId: number, selectedProduct?: SimpleProduct, customerId?: string) {
        this.productId = productId;
        this.channelId = channelId;
        this.selectedProduct = selectedProduct;
        this.customerId = customerId;
    }

    public getCacheKey = (): string => 'PriceForSelectedVariant';
    public getCacheObjectType = (): string => 'Price';
    public dataCacheType = (): Msdyn365.CacheType => 'none';
}

export const createGetVariantPriceInput = (
    inputData: Msdyn365.ICreateActionContext<Msdyn365.IGeneric<Msdyn365.IAny>>
): PriceForSelectedVariantInput => {
    const productId = getSelectedProductIdFromActionInput(inputData);
    if (productId) {
        return new PriceForSelectedVariantInput(+productId, +inputData.requestContext.apiSettings.channelId, undefined);
    }
    throw new Error('Unable to create PriceForSelectedVariantInput, no productId found on module config or query');
};

export async function getVariantPriceAction(
    input: PriceForSelectedVariantInput,
    ctx: Msdyn365.IActionContext
): Promise<ProductPrice | null> {
    let affiliations: AffiliationLoyaltyTier[] | undefined = [];
    if (ctx.requestContext.user.isAuthenticated) {
        const cart = await getCartFromCustomer(ctx);
        affiliations = cart?.AffiliationLines;
    }

    return Promise.resolve()
        .then(() => {
            const activeProduct: SimpleProduct | undefined = input.selectedProduct;
            if (!activeProduct) {
                const selectedVariantInput: SelectedVariantInput = new SelectedVariantInput(
                    input.productId,
                    input.channelId,
                    undefined,
                    undefined,
                    ctx.requestContext
                );
                return getSelectedVariant(selectedVariantInput, ctx);
            }
            return activeProduct;
        })
        .then<ProductPrice | null>(async (productResult: SimpleProduct | null) => {
            const catalogId = Msdyn365.getCatalogId(ctx.requestContext);
            const projectDomain: ProjectionDomain = {
                ChannelId: +ctx.requestContext.apiSettings.channelId,
                CatalogId: catalogId
            };

            const activeProduct: SimpleProduct | undefined = productResult as SimpleProduct | undefined;
            if (activeProduct) {
                return getActivePricesAsync(
                    { callerContext: ctx, queryResultSettings: QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx) },
                    projectDomain,
                    [activeProduct.RecordId],
                    new Date(),
                    input.customerId,
                    affiliations,
                    true
                ).then((productPrices: ProductPrice[]) => {
                    if (!ArrayExtensions.hasElements(productPrices)) {
                        throw new Error('[getVariantPriceAction]Invalid response received from getActivePriceAsync');
                    }
                    return productPrices[0];
                });
            }
            return null;
        })
        .catch((error: Error) => {
            ctx.trace(error.message);
            ctx.telemetry.exception(error);
            ctx.telemetry.debug('[getVariantPriceAction]Error executing action');
            throw new Error('[getVariantPriceAction]Error executing action');
        });
}

export const getVariantPriceActionDataAction = Msdyn365.createObservableDataAction({
    id: '@msdyn365-commerce-modules/retail-actions/get-price-for-selected-variant',
    action: getVariantPriceAction as Msdyn365.IAction<ProductPrice | null>,
    input: createGetVariantPriceInput
});

export default getVariantPriceActionDataAction;
