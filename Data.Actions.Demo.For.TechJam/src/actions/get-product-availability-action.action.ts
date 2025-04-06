import * as Msdyn365 from '@msdyn365-commerce/core';
import { QueryResultSettingsProxy, getSelectedProductIdFromActionInput } from '@msdyn365-commerce-modules/retail-actions';
import { OrgUnitAvailability, OrgUnitsDataActions } from '@msdyn365-commerce/retail-proxy';

export class GetProductAvailabilityActionInput implements Msdyn365.IActionInput {
    public channelId?: number;
    public productId: number;
    constructor(_productId: number | string, _channelId?: number) {
        this.channelId = _channelId;
        this.productId = +_productId;
    }
    // a cache object type and an appropriate cache key
    public getCacheKey = () => `${this.channelId}-${this.productId}`;
    public getCacheObjectType = () => 'ProductAvailability';
    public dataCacheType = (): Msdyn365.CacheType => 'application';
}

export interface IGetProductAvailabilityActionData {
    text: string;
}
const createInput = (inputData: Msdyn365.ICreateActionContext<Msdyn365.IGeneric<Msdyn365.IAny>>): Msdyn365.IActionInput => {
    const productId: any = getSelectedProductIdFromActionInput(inputData);
    return new GetProductAvailabilityActionInput(productId, inputData.requestContext.channel?.RecordId);
};

export async function getProductAvailabilityAction(
    input: GetProductAvailabilityActionInput,
    ctx: Msdyn365.IActionContext
): Promise<OrgUnitAvailability[]> {
    const results: OrgUnitAvailability[] = await OrgUnitsDataActions.getProductAvailabilityAsync(
        {
            callerContext: ctx,
            queryResultSettings: QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx)
        },
        input.productId
    );

    if (results.length === 0) {
        ctx.telemetry.error('No Product Availability found');
        return [];
    }
    return results;
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<OrgUnitAvailability[]>>getProductAvailabilityAction,
    id: 'ContosoGetProductAvailabilityAction',
    input: createInput
    // TODO: Uncomment the below line if this is a meant to be a batched data action
    // isBatched: true
});
