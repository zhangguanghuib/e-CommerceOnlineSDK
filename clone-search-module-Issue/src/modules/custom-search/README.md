### Search Module

```jsx noeditor
const Search = require('./search.tsx').default;
const mockData = require('./mocks/search.json');

<Search
    data={mockData.data}
    config={mockData.config}
    resources={mockData.resources}/>
```
### Local testing

1. `yarn start`
1. http://localhost:8000/modules/?type=search:search