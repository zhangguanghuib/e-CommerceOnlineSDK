import { getCatalogId, IAny, ICommerceApiSettings, IDictionary, IGeneric, IRequestContext } from '@msdyn365-commerce/core';
import { getByIdsAsync } from '@msdyn365-commerce/retail-proxy/dist/DataActions/ProductsDataActions.g';
import { SimpleProduct } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import * as Msdyn365 from '@msdyn365-commerce/core';
import { QueryResultSettingsProxy, ArrayExtensions } from '@msdyn365-commerce-modules/retail-actions';
import { generateProductImageUrl } from '../utilities/utils';
/**
 * ContosoGetSimpleProducts Input Action
 */
export class ContosoProductInput implements Msdyn365.IActionInput {
    public productId: number;

    public channelId: number;

    public warehouseId?: string;

    public catalogId?: number;

    private readonly apiSettings: ICommerceApiSettings;

    public constructor(
        productId: number | string,
        apiSettings: ICommerceApiSettings,
        channelId?: number,
        warehouseId?: string,
        requestContext?: IRequestContext,
        catalogId?: number
    ) {
        this.apiSettings = apiSettings;
        this.productId = +productId;
        this.channelId = channelId || apiSettings.channelId;
        this.warehouseId = warehouseId;
        this.catalogId = catalogId;

        if (requestContext && catalogId === undefined) {
            this.catalogId = getCatalogId(requestContext);
        }
    }

    // TODO: Determine if the results of this get action should cache the results and if so provide
    // a cache object type and an appropriate cache key
    public getCacheKey = () => {
        return `${this.apiSettings.channelId}-${this.apiSettings.catalogId}-${this.productId}`;
    };
    public getCacheObjectType = () => 'SimpleProduct';
    public dataCacheType = (): Msdyn365.CacheType => 'application';
}

// TODO: Create a data model here or import one to capture the response of the action
export interface IContosoGetSimpleProductsData {
    text: string;
}

/**
 * TODO: Use this function to create the input required to make the action call
 */
const createContosoSimpleProductsInput = (inputData: Msdyn365.ICreateActionContext<IGeneric<IAny>>): Msdyn365.IActionInput[] => {
    let productIds: string | string[] = inputData.config && inputData.config.productIds;
    if (!productIds) {
        return [];
    }
    if (typeof productIds === 'string') {
        productIds = productIds.split(',');
    }
    return !Array.isArray(productIds)
        ? []
        : productIds.map((productId: string) => {
              const productIdNumber: number = +productId;
              return new ContosoProductInput(
                  productIdNumber,
                  inputData.requestContext.apiSettings,
                  inputData.requestContext.channel?.RecordId,
                  undefined,
                  inputData.requestContext
              );
          });
};
export async function getContosoSimpleProductsAction(
    inputs: ContosoProductInput[],
    ctx: Msdyn365.IActionContext
): Promise<SimpleProduct[]> {
    if (!ArrayExtensions.hasElements(inputs)) {
        ctx.telemetry.trace('[getContosoSimpleProductsAction] Invalid or empty inputs passed.');
        return [];
    }

    const productIdMapping: IDictionary<number> = {};
    for (let index = 0; index < inputs.length; index++) {
        // eslint-disable-next-line security/detect-object-injection
        productIdMapping[inputs[index].productId] = index;
    }

    const getProductPromises: Promise<SimpleProduct[]>[] = [];
    const catalogIds: (number | undefined)[] = ArrayExtensions.unique(inputs.map(input => input.catalogId));

    for (const catalogId of catalogIds) {
        const productInputs = inputs.filter(input => input.catalogId === catalogId);
        let queryResultSettings = QueryResultSettingsProxy.getPagingFromInputDataOrDefaultValue(ctx);
        if (ArrayExtensions.hasElements(productInputs) && ctx.requestContext?.app?.platform?.defaultPageSizeForAPI) {
            queryResultSettings = {
                Paging: {
                    Top: productInputs.length,
                    Skip: 0
                }
            };
        }
        getProductPromises.push(
            getByIdsAsync(
                {
                    callerContext: ctx,
                    queryResultSettings
                },
                inputs[0].channelId,
                productInputs.map(input => input.productId),
                productInputs[0].warehouseId ?? null,
                catalogId ?? 0
            )
                .then((products: SimpleProduct[]) => {
                    return products;
                })
                .catch((error: Error) => {
                    ctx.telemetry.error(`[getContosoSimpleProductsAction] Error fetching products: ${error.message}`);
                    return <SimpleProduct[]>{};
                })
        );
    }

    const products = ArrayExtensions.flatten(await Promise.all(getProductPromises));
    const mappedProducts = products
        .map((product: SimpleProduct) => {
            try {
                if (!product.PrimaryImageUrl) {
                    product.PrimaryImageUrl = generateProductImageUrl(product, ctx.requestContext.apiSettings);
                }
                return product;
            } catch (error) {
                ctx.telemetry.error(`'[getContosoSimpleProductsAction] Unable to update ImageURL for Product'`);
                return undefined;
            }
        })
        .reduce((memo: SimpleProduct[], product: SimpleProduct | undefined) => {
            if (!product) {
                return memo;
            }
            const index = productIdMapping[product.RecordId];
            // eslint-disable-next-line security/detect-object-injection
            memo[index] = product;
            return memo;
        }, []);

    return inputs.map((input: ContosoProductInput) => {
        const foundProduct = mappedProducts.find(product => product && product.RecordId === input.productId);
        return foundProduct || <SimpleProduct>{};
    });
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<SimpleProduct[]>>getContosoSimpleProductsAction,
    id: 'ContosoGetSimpleProducts',
    input: createContosoSimpleProductsInput
    // isBatched: true
});
