import { client } from "../graphql/client.ts";
import type { ResultOf } from "gql.tada";
import { getContributedRepositories } from "../graphql/operations.ts";

type RepositoryNodes = NonNullable<
  ResultOf<typeof getContributedRepositories>["user"]
>["repositoriesContributedTo"]["nodes"];

export interface Repository {
  owner: string;
  repo: string;
}

export function parseRepository(repositoryUrl: string): Repository {
  const [owner, repo] = repositoryUrl.split("/").slice(-2);

  return {
    owner,
    repo,
  };
}

export async function getContributedRepositoriesPaginated(
  login: string,
  cursor: string | null = null,
  allRepos: NonNullable<RepositoryNodes> = [],
) {
  const { data } = await client.query(getContributedRepositories, {
    login,
    cursor,
  });

  const repos = data?.user?.repositoriesContributedTo.nodes ?? [];
  allRepos.push(...repos);

  if (data?.user?.repositoriesContributedTo.pageInfo.hasNextPage) {
    const nextCursor = data.user.repositoriesContributedTo.pageInfo.endCursor;

    return getContributedRepositoriesPaginated(login, nextCursor, allRepos);
  } else {
    return allRepos;
  }
}
