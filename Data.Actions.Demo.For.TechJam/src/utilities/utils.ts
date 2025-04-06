import { ProductSearchResult, SimpleProduct } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { ICommerceApiSettings } from '@msdyn365-commerce/core';
export const generateProductImageUrl = (
    product: SimpleProduct | ProductSearchResult,
    apiSettings: ICommerceApiSettings
): string | undefined => {
    return `${apiSettings.baseImageUrl}Products/${product.ProductNumber}_000_001.png`;
};
