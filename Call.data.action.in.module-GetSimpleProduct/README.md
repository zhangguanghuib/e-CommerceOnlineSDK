# Msdyn365 Commerce online

## Sample - Call data action in module


- yarn msdyn365 add-data-action get-product
- yarn msdyn365 add-data-action get-simpleproduct-with-availability
- yarn msdyn365 add-data-action get-product-availability-action

- yarn msdyn365 add-module show-productavails-when-pageload
- yarn msdyn365 add-module get-productinfo-when-pageload
- yarn msdyn365 add-module show-category-products
- yarn msdyn365 add-module show-product-details
- yarn msdyn365 add-module show-simpleproduct-with-availabilities

# finlly works:
- http://localhost:4000/page?mock=show-product-with-availabilities // use chained data action in module
- http://localhost:4000/page?mock=show-category-products  // sample module 
- http://localhost:4000/page?mock=show-product-details  // use data action in module only for product details
	
- https://localhost:4000/modules?type=get-productinfo-when-pageload&actionMock=get-productinfo-when-pageload:my-module-mock 
// page load data action only for product details
 
- https://localhost:4000/modules?type=show-productavails-when-pageload&actionMock=show-productavails-when-pageload:my-module-mock 
// page load data action for producy details and availability

