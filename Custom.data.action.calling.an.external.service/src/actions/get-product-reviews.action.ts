import * as Msdyn365 from '@msdyn365-commerce/core';

/**
 * GetProductReviews Input Action
 */
export class GetProductReviewsInput implements Msdyn365.IActionInput {
    // TODO: Construct the input needed to run the action
    constructor() {}

    // TODO: Determine if the results of this get action should cache the results and if so provide
    // a cache object type and an appropriate cache key
    public getCacheKey = () => `DEFAULT`;
    public getCacheObjectType = () => 'IGetProductReviewsData';
    public dataCacheType = (): Msdyn365.CacheType => 'application';
}

// TODO: Create a data model here or import one to capture the response of the action
export interface IGetProductReviewsData {
    text: string;
}

/**
 * TODO: Use this function to create the input required to make the action call
 */
const createInput = (args: Msdyn365.ICreateActionContext): Msdyn365.IActionInput => {
    return new GetProductReviewsInput();
};

/**
 * TODO: Use this function to call your action and process the results as needed
 */
async function action(input: GetProductReviewsInput, ctx: Msdyn365.IActionContext): Promise<IGetProductReviewsData> {
    const result = await Msdyn365.sendRequest<string>('https://jsonplaceholder.typicode.com/comments?postId=1').then(
        (response: Msdyn365.IHTTPResponse<string>) => {
            return response.data;
        }
    );
    return { text: JSON.stringify(result) };
}

export default Msdyn365.createObservableDataAction({
    action: <Msdyn365.IAction<IGetProductReviewsData>>action,
    id: 'GetProductReviews',
    input: createInput
});
