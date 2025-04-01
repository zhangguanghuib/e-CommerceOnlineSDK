import * as Msdyn365 from '@msdyn365-commerce/core';

import { createObservableDataAction, getCatalogId, IAction, ICreateActionContext, IGeneric } from '@msdyn365-commerce/core';

import { SimpleProduct } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { ProductsDataActions } from '@msdyn365-commerce/retail-proxy';
import { QueryResultSettingsProxy, getSelectedProductIdFromActionInput } from '@msdyn365-commerce-modules/retail-actions';

export class ProductInput implements Msdyn365.IActionInput {
    public productId: number;

    public channelId?: number;

    public catalogId: number;

    public constructor(productId: number | string, channelId?: number, requestContext?: Msdyn365.IRequestContext, catalogId?: number) {
        this.productId = +productId;
        this.channelId = channelId ?? 0;
        this.catalogId = catalogId ?? 0;

        if (requestContext && catalogId === undefined) {
            this.catalogId = getCatalogId(requestContext);
        }
    }
    public getCacheKey = (): string => 'getProductDetails';
    public getCacheObjectType = (): string => 'FeatureProduct';
    public dataCacheType = (): Msdyn365.CacheType => 'none';
}

export const createSimpleProductsInput = (inputData: ICreateActionContext<IGeneric<Msdyn365.IAny>>): Msdyn365.IActionInput => {
    const productId: any = getSelectedProductIdFromActionInput(inputData);
    return new ProductInput(productId, undefined, inputData.requestContext);
};

export async function getSimpleProductsAction(inputs: ProductInput, ctx: Msdyn365.IActionContext): Promise<SimpleProduct> {
    const result = await ProductsDataActions.getByIdsAsync(
        {
            callerContext: ctx,
            queryResultSettings: QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx)
        },
        inputs.channelId || 0,
        [inputs.productId],
        null,
        inputs.catalogId ?? 0
    );
    return result[0];
}

export default createObservableDataAction({
    id: '@msdyn365-commerce-modules/retail-actions/get-simple-product',
    action: <IAction<SimpleProduct>>getSimpleProductsAction,
    input: createSimpleProductsInput
});
