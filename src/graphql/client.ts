import { Client, fetchExchange } from "@urql/core";

const ROOT_GRAPHQL_URL = "https://api.github.com/graphql";

const headers = new Headers({
  Authorization: `bearer ${process.env.GITHUB_TOKEN}`,
});

export const client = new Client({
  url: ROOT_GRAPHQL_URL,
  exchanges: [fetchExchange],
  fetchOptions: { headers },
});
