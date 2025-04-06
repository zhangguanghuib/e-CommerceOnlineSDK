import * as Msdyn365 from '@msdyn365-commerce/core';

import { SimpleProduct } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { getSelectedProductIdFromActionInput } from '@msdyn365-commerce-modules/retail-actions';
import { ProductInput, getSimpleProductAction } from './get-product.action';
import { GetProductAvailabilityActionInput, getProductAvailabilityAction } from './get-product-availability-action.action';

import { IAny, ICreateActionContext, IGeneric } from '@msdyn365-commerce/core';
import { OrgUnitAvailability } from '@msdyn365-commerce/retail-proxy';

export class GetSimpleProductWithAvailabilityInput implements Msdyn365.IActionInput {
    public channelId?: number;
    public calalogId?: number;
    public productId: number;
    constructor(_productId: number | string, _channelId?: number, requestContext?: Msdyn365.IRequestContext, catalogId?: number) {
        this.channelId = _channelId;
        this.productId = +_productId;
        this.calalogId = catalogId;

        if (requestContext && _channelId === undefined) {
            this.channelId = requestContext.channel?.RecordId;
        }

        if (requestContext && catalogId === undefined) {
            this.calalogId = Msdyn365.getCatalogId(requestContext);
        }
    }

    // TODO: Determine if the results of this get action should cache the results and if so provide
    // a cache object type and an appropriate cache key
    public getCacheKey = () => `getSimpleproductWithAvailabilityInput`;
    public getCacheObjectType = () => 'SimpleproductWithAvailabilityInput';
    public dataCacheType = (): Msdyn365.CacheType => 'application'; // 'application' | 'request' | 'none'
}

// TODO: Create a data model here or import one to capture the response of the action
export interface IGetSimpleproductWithAvailabilityData {
    simpleProduct: SimpleProduct | undefined;
    orgUnitAvailabilities: OrgUnitAvailability[];
}

const createChainDataActionInput = (inputData: ICreateActionContext<IGeneric<IAny>>): Msdyn365.IActionInput => {
    const productId: any = getSelectedProductIdFromActionInput(inputData);
    return new ProductInput(productId, inputData.requestContext.channel?.RecordId, inputData.requestContext);
};

export async function getSimpleProductWithAvailabilityAction(
    input: GetSimpleProductWithAvailabilityInput,
    ctx: Msdyn365.IActionContext
): Promise<IGetSimpleproductWithAvailabilityData> {
    let orgUnitAvailabilities: OrgUnitAvailability[] = [];
    let simpleProduct: SimpleProduct | undefined;
    const productInput = new ProductInput(input.productId, input.channelId, ctx.requestContext, 0);
    try {
        simpleProduct = await getSimpleProductAction(productInput, ctx);
        if (simpleProduct) {
            const productAvailabilityInput = new GetProductAvailabilityActionInput(input.productId, input.channelId);
            orgUnitAvailabilities = await getProductAvailabilityAction(productAvailabilityInput, ctx);
        }
    } catch (error) {
        console.log(error);
    }
    return {
        simpleProduct,
        orgUnitAvailabilities
    };
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<IGetSimpleproductWithAvailabilityData>>getSimpleProductWithAvailabilityAction,
    id: 'ContosoGetSimpleproductWithAvailability',
    input: createChainDataActionInput,
    isBatched: true
});
