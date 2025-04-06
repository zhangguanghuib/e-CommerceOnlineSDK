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
- yarn msdyn365 add-module show-product-collections
- yarn msdyn365 add-data-action contoso-get-simple-products

# finlly works:
- http://localhost:4000/page?mock=show-product-with-availabilities // use chained data action in module
- http://localhost:4000/page?mock=show-category-products  // sample module 
- http://localhost:4000/page?mock=show-product-details  // use data action in module only for product details
	
- https://localhost:4000/modules?type=get-productinfo-when-pageload&actionMock=get-productinfo-when-pageload:my-module-mock 
// page load data action only for product details
 
- https://localhost:4000/modules?type=show-productavails-when-pageload&actionMock=show-productavails-when-pageload:my-module-mock 
// page load data action for product details and availability
- http://localhost:4000/page?mock=show-product-collections // Call core data action get-simple-products in module code.
# Git Command:
## When I tried to push,  I got this error the local file has confliction with remote, then I fix it by this command

- git pull origin main
