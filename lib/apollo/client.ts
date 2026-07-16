import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

let client: ApolloClient<object> | null = null;

export function getApolloClient(): ApolloClient<object> {
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({ uri: "/api/graphql", credentials: "same-origin" }),
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: { fetchPolicy: "cache-and-network" },
      },
    });
  }
  return client;
}
