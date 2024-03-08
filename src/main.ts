import { PerformanceObserver, performance } from "node:perf_hooks";
import { Octokit } from "octokit";
import { getContributedRepositoriesPaginated, parseRepository } from "./utils";
import prettyMilliseconds from "pretty-ms";

const performanceObserver = new PerformanceObserver((items) => {
  items
    .getEntries()
    .forEach((entry) =>
      console.log(`${entry.name} took ${prettyMilliseconds(entry.duration)}`),
    );
});
performanceObserver.observe({ entryTypes: ["measure"] });

performance.mark("execution-start");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

// const rateLimit = await octokit.rest.rateLimit.get();
// console.log(rateLimit.data);

const repositoryUrl = "https://github.com/encode/starlette";
const repository = parseRepository(repositoryUrl);

performance.mark("listContributors-start");

const contributors = (
  await octokit.paginate(octokit.rest.repos.listContributors, {
    ...repository,
    per_page: 100,
  })
).filter((c) => c.type !== "Bot" && c.contributions > 1);

performance.mark("listContributors-end");
console.log(
  `found ${contributors.length} valid contributors for ${repositoryUrl}`,
);

performance.mark("repositoriesContributedTo-start");

const repositories = (
  await Promise.all(
    contributors.map(({ login }) =>
      getContributedRepositoriesPaginated(<string>login),
    ),
  )
).flat();

performance.mark("repositoriesContributedTo-end");
console.log(`retrieved ${repositories.length} repositories`);

const commonContributedRepositories: Record<string, number> = {};

for (const repository of repositories) {
  if (repository) {
    commonContributedRepositories[repository.nameWithOwner] =
      commonContributedRepositories[repository.nameWithOwner] + 1 || 1;
  }
}

const result = Object.fromEntries(
  Object.entries(commonContributedRepositories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5),
);
console.log(result);

performance.mark("execution-end");

performance.measure(
  "> listContributors",
  "listContributors-start",
  "listContributors-end",
);
performance.measure(
  "> repositoriesContributedTo",
  "repositoriesContributedTo-start",
  "repositoriesContributedTo-end",
);
performance.measure("execution", "execution-start", "execution-end");
