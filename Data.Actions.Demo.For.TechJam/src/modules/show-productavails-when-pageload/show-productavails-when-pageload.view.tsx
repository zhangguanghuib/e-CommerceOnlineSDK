/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import * as React from 'react';
import { IShowProductavailsWhenPageloadViewProps } from './show-productavails-when-pageload';

export default (props: IShowProductavailsWhenPageloadViewProps) => {
    const { simpleProduct, productAvailabilityData } = props.state;
    console.log(`${simpleProduct} from ShowProductavailsWhenPageload in render`);
    console.log(`${productAvailabilityData} from ShowProductavailsWhenPageload in render`);

    return (
        <div className='container'>
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
                    {productAvailabilityData && productAvailabilityData.length > 0 ? (
                        <div className='ms-orgunit-availability-container'>
                            <h5 className='mt-4'>Availability Information:</h5>
                            <ul className='list-group'>
                                {productAvailabilityData.map((availability, index) => (
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
