---
trigger: model_decision
description: Whenever you are asked to implement a feature, check this rule first to make sure you implement to the user's preferences
globs:
---

- Whenever you make changes to components or utilities or other typescript files could you take a tdd approach by writing tests first for whatever feature needs to be built. The tests should cover the functionality we need to build and then you can iterate on building the features until those tests pass. The idea is that we want to come up with a plan or hypothesis first, write the tests for it and then iterate until the tests pass.
- When you encounter files that do have tests, update the tests.
- Be discriminant with what test you write. You don't have to test every little, single, small thing. Think like a senior, experienced engineer who knows the things that need tests and the things that do not.
- We are using Vitest for tests so make sure you use Vitest APIs and not Jest APIs.
- If you need to mock network calls in tests, please use Mock Service Worker (MSW)
- Do not write tests for NextJS api route handlers. You can make functions inside the route handler that perform atomic operations and then test those.
- Do not write tests for NextJS page.tsx files. You can make smaller components that composed within the page and then test those.
- Most of the code in this project is not tested yet. So when you encounter files that have no tests at all and they don't fall under the exclusions defined in these rules then write the tests.