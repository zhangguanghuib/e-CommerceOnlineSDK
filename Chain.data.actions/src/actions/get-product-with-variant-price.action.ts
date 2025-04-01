/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as Msdyn365 from '@msdyn365-commerce/core';
import { ProductPrice, SimpleProduct } from '@msdyn365-commerce/retail-proxy';
import getSimpleProductsAction, { ProductInput } from './get-product.action';
import { getSelectedProductIdFromActionInput } from '@msdyn365-commerce-modules/retail-actions';
import { getCatalogId } from '@msdyn365-commerce/core';
import getVariantPrice from './get-variant-price.action';

export interface SimpleProductWithPrice extends SimpleProduct {
    variantPrice?: ProductPrice | null;
}

export class ChainDataActionInput implements Msdyn365.IActionInput {
    public productId: number;

    public channelId: number;

    public catalogId?: number;
    public constructor(productId: number | string, channelId?: number, requestContext?: Msdyn365.IRequestContext, catalogId?: number) {
        this.productId = +productId;
        this.channelId = channelId ?? 0;
        this.catalogId = catalogId;

        if (requestContext && catalogId === undefined) {
            this.catalogId = getCatalogId(requestContext);
        }
    }
    // a cache object type and an appropriate cache key
    public getCacheKey = (): string => `chainDataActionInput`;
    public getCacheObjectType = (): string => 'ChainProduct';
    public dataCacheType = (): Msdyn365.CacheType => 'none';
}

export const createChainDataActionInput = (
    inputData: Msdyn365.ICreateActionContext<Msdyn365.IGeneric<Msdyn365.IAny>>
): Msdyn365.IActionInput => {
    const productId: any = getSelectedProductIdFromActionInput(inputData);
    return new ProductInput(productId, undefined, inputData.requestContext);
};

export async function getProductWithVariantPriceAction(
    input: ProductInput,
    ctx: Msdyn365.IActionContext
): Promise<SimpleProductWithPrice | undefined> {
    let product: SimpleProductWithPrice;
    const pro = new ProductInput(input.productId, undefined, ctx.requestContext, 0);
    try {
        product = await getSimpleProductsAction(pro, ctx);
        if (product) {
            product.variantPrice = await getVariantPrice(input, ctx);
            return product;
        } else {
            return <SimpleProductWithPrice>{};
        }
        // eslint-disable-next-line no-empty
    } catch (err) {}

    return undefined;
}

export default Msdyn365.createDataAction({
    id: 'ChainDataAction',
    action: getProductWithVariantPriceAction as Msdyn365.IAction<SimpleProductWithPrice | null>,
    input: createChainDataActionInput
});
