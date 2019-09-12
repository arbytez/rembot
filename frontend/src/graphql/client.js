import { execute, makePromise } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';

const isBrowser = typeof window !== 'undefined';

const uri = process.env.ENDPOINT_URL;

const httpLink = isBrowser
  ? new HttpLink({
      uri,
      credentials: 'include'
    })
  : null;

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

let link;
if (isBrowser) link = errorLink.concat(httpLink);

// const operation = {
//   query: gql`
//     query {
//       hello
//     }
//   `,
//   variables: {}, //optional
//   operationName: {}, //optional
//   context: {}, //optional
//   extensions: {} //optional
// };

// execute returns an Observable so it can be subscribed to
const execSub = operation => {
  execute(link, operation).subscribe({
    next: data =>
      console.log(`received data: ${JSON.stringify(data, null, 2)}`),
    error: error => console.log(`received error ${error}`),
    complete: () => console.log(`complete`)
  });
};

// For single execution operations, a Promise can be used
const exec = operation => {
  return makePromise(execute(link, operation));
};

export { exec, execSub };
