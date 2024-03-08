import { graphql } from "gql.tada";

export const getContributedRepositories = graphql(`
  query getUserRepositories($login: String!, $cursor: String) {
    user(login: $login) {
      repositoriesContributedTo(
        first: 100
        after: $cursor
        contributionTypes: [COMMIT, PULL_REQUEST, ISSUE]
        isLocked: false
        includeUserRepositories: false
      ) {
        totalCount
        nodes {
          nameWithOwner
          url
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`);
