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
- yarn msdyn365 add-module contoso-show-product-collections
# Products:
68719495953,68719495895,68719495907,68719492208,68719495871,68719495954,68719495955,68719495919
# finlly works:
- http://localhost:4000/page?mock=show-product-with-availabilities // use chained data action in module
- http://localhost:4000/page?mock=show-category-products  // sample module 
- http://localhost:4000/page?mock=show-product-details  // use data action in module only for product details	
- https://localhost:4000/modules?type=get-productinfo-when-pageload&actionMock=get-productinfo-when-pageload:my-module-mock 
// page load data action only for product details 
- https://localhost:4000/modules?type=show-productavails-when-pageload&actionMock=show-productavails-when-pageload:my-module-mock 
// page load data action for product details and availability
- http://localhost:4000/page?mock=show-product-collections // Call core data action get-simple-products in module code.
- http://localhost:4000/page?mock=contoso-show-product-collections // Call core data action get-simple-products in module code.
# In live website:
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_show_product_details?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_show_simpleproduct_with_availabilities?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_get_productinfo_with_pageload?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_show_productavails_when_pageload?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_show_product_collections?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_contoso_show_product_collections?domain=www.dyncommerce3uat.com
- https://dyncommerce3uat.dynamics365commerce.ms/ghfabrikam2/techjam_show_category_products?domain=www.dyncommerce3uat.com
# Git Command:
## When I tried to push,  I got this error the local file has confliction with remote, then I fix it by this command

- git pull origin main
