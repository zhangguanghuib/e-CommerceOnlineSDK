/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';
// import { OrgUnitAvailability } from '@msdyn365-commerce/retail-proxy';
import { SimpleProduct, OrgUnitAvailability } from '@msdyn365-commerce/retail-proxy/dist/Entities/CommerceTypes.g';
import { IShowSimpleproductWithAvailabilitiesViewProps } from './show-simpleproduct-with-availabilities';

export default (props: IShowSimpleproductWithAvailabilitiesViewProps) => {
    const { getSimpleproductWithAvailabilityData, getProductInfo } = props;
    const simpleProduct: SimpleProduct | undefined = getSimpleproductWithAvailabilityData?.simpleProduct;
    const orgUnitAvailabilities: OrgUnitAvailability[] | undefined = getSimpleproductWithAvailabilityData?.orgUnitAvailabilities;
    const [newProductId, setNewProductId] = React.useState(simpleProduct?.RecordId);

    const handleProductIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newProductId = Number(event.target.value);
        console.log('newProductId', newProductId);
        setNewProductId(newProductId);
    };
    const handleInputSubmit = () => {
        console.log('Final input value:', newProductId);
        if (newProductId !== undefined && newProductId !== null && newProductId !== 0) {
            //handleNewProductId(newProductId);
            getProductInfo(newProductId);
        }
    };
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            if (newProductId !== undefined && newProductId !== null && newProductId !== 0) {
                //handleNewProductId(newProductId);
                getProductInfo(newProductId);
            }
        }
    };
    // const availabilities: OrgUnitAvailability[] | undefined = getSimpleproductWithAvailabilityData?.orgUnitAvailability;
    return (
        <div className='container'>
            <div>
                <button type='button' className='btn btn-primary' onClick={() => getProductInfo(newProductId || 0)}>
                    Get Product Info!
                </button>
                <input
                    type='text'
                    value={newProductId}
                    onChange={handleProductIdChange}
                    onBlur={handleInputSubmit}
                    onKeyDown={handleKeyDown}
                    className='form-control'
                    style={{ marginLeft: '10px' }}
                />
            </div>
            {/* Render simpleProduct if available */}
            {simpleProduct && simpleProduct.RecordId ? (
                <div className='ms-search-result-container_Products'>
                    <ul className='list-unstyles'>
                        <li className='ms-product-search-result__item'>
                            <img
                                src={simpleProduct.PrimaryImageUrl}
                                alt='product'
                                className='img-fluid p-3'
                                style={{ maxWidth: '450px', maxHeight: '450px' }}
                            />
                            <h4 className='msc-product__title'>Product ID: {simpleProduct.RecordId}</h4>
                            <h4 className='msc-product__title'>Product Number: {simpleProduct.ProductNumber}</h4>
                            <h4 className='msc-product__title'>Product Name: {simpleProduct.Name}</h4>
                            <h4 className='msc-price__price'>Product Price: {simpleProduct.Price}</h4>
                            <span className='badge bg-info text-dark p-2 rounded'>
                                <strong> Product Description:</strong> {simpleProduct.Description}
                            </span>
                        </li>
                    </ul>

                    {/* Render orgUnitAvailabilities if available */}
                    {orgUnitAvailabilities && orgUnitAvailabilities.length > 0 ? (
                        <div className='ms-orgunit-availability-container'>
                            <h5 className='mt-4'>Availability Information:</h5>
                            <ul className='list-group'>
                                {orgUnitAvailabilities.map((availability, index) => (
                                    <li key={index} className='list-group-item'>
                                        <p>
                                            <strong>Org Unit Name:</strong> {availability.OrgUnitLocation?.OrgUnitName}
                                        </p>
                                        {availability.ItemAvailabilities && availability.ItemAvailabilities.length > 0 ? (
                                            <p>
                                                {availability.ItemAvailabilities.map((itemAvailability, itemIndex) => (
                                                    <div key={itemIndex} className='badge bg-success m-1'>
                                                        <div>
                                                            <strong>Inventory Location ID:</strong> {itemAvailability.InventoryLocationId}
                                                        </div>
                                                        <div>
                                                            <strong>Available Quantity:</strong> {itemAvailability.AvailableQuantity}
                                                        </div>
                                                        <div>
                                                            <strong>Unit of Measure:</strong> {itemAvailability.UnitOfMeasure}
                                                        </div>
                                                        <hr />
                                                    </div>
                                                ))}
                                            </p>
                                        ) : (
                                            <p>No item availabilities found.</p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className='text-muted mt-3'>No availability information found.</p>
                    )}
                </div>
            ) : (
                <div>No product found</div>
            )}
        </div>
    );
};
