import * as Msdyn365 from '@msdyn365-commerce/core';
import { SimpleProduct } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { ProductsDataActions } from '@msdyn365-commerce/retail-proxy';
import { QueryResultSettingsProxy, getSelectedProductIdFromActionInput } from '@msdyn365-commerce-modules/retail-actions';
import { generateProductImageUrl } from '../utilities/utils';

export class ProductInput implements Msdyn365.IActionInput {
    public channelId?: number;
    public calalogId?: number;
    public productId: number;
    constructor(_productId: number | string, _channelId?: number, requestContext?: Msdyn365.IRequestContext, catalogId?: number) {
        this.channelId = _channelId;
        this.productId = +_productId;
        this.calalogId = catalogId;

        if (requestContext && catalogId === undefined) {
            this.calalogId = Msdyn365.getCatalogId(requestContext);
        }
    }

    public getCacheKey = () => `${this.channelId}-${this.productId}`;
    public getCacheObjectType = () => 'ProductDetails';
    public dataCacheType = (): Msdyn365.CacheType => 'application';
}

const createInput = (inputData: Msdyn365.ICreateActionContext<Msdyn365.IGeneric<Msdyn365.IAny>>): Msdyn365.IActionInput => {
    const productId: any = getSelectedProductIdFromActionInput(inputData);
    return new ProductInput(productId, inputData.requestContext.channel?.RecordId, inputData.requestContext);
};

/**
 * TODO: Use this function to call your action and process the results as needed
 */
export async function getSimpleProductAction(input: ProductInput, ctx: Msdyn365.IActionContext): Promise<SimpleProduct> {
    const results = await ProductsDataActions.getByIdsAsync(
        {
            callerContext: ctx,
            queryResultSettings: QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx)
        },
        input.channelId || 0,
        [input.productId],
        null,
        input.calalogId ?? 0
    );
    if (results.length === 0) {
        ctx.telemetry.error('No Product found');
        return <SimpleProduct>{};
    }
    const product: SimpleProduct = results[0];
    if (product.PrimaryImageUrl === undefined) {
        product.PrimaryImageUrl = generateProductImageUrl(product, ctx.requestContext.apiSettings);
    }
    return product;
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<SimpleProduct>>getSimpleProductAction,
    id: 'ContosoGetProductById',
    input: createInput
});
