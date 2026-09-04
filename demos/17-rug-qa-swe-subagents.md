# Demo 9: Orchestrating RUG, SWE, and QA Subagents

> [!NOTE]
> This is a presenter script. The trainer runs each prompt in GitHub Copilot Chat and narrates the handoffs.

In this demo, we use three custom agents already configured in `.github/agents`:

- **SWE** investigates and implements a focused change.
- **QA** independently reviews behavior, tests edge cases, and reports evidence.
- **RUG** decomposes a larger request, delegates implementation to SWE, delegates validation to QA, and repeats until validation passes.

## Prerequisites

- A GitHub account with Copilot enabled and access to Agent Mode and custom agents.
- VS Code with GitHub Copilot Chat enabled.
- Project dependencies installed with `npm install` and `npm install --prefix frontend`.
- The repository opened at its root so Copilot discovers the agents in `.github/agents`.

## Before the demo

1. Open the Chat view in VS Code.
2. Confirm that **RUG**, **SWE**, and **QA** appear in the agent picker.
3. Run the baseline backend tests:

   ```bash
   npm run test:backend
   ```

4. Explain that each subagent receives a fresh context window. RUG retains the task-level view while SWE and QA do the detailed work.

## Part 1 - Use SWE directly

Select **SWE** in the agent picker and enter:

```prompt
Review the backend books API and its tests. Add a case-insensitive author filter to the existing books endpoint using the query parameter `author`.

Requirements:
- Preserve all existing endpoint behavior when `author` is omitted.
- Match partial author names case-insensitively.
- Add backend tests for a successful match, mixed-case input, no matches, and the omitted parameter.
- Keep the change focused and do not modify the frontend.
- Run `npm run test:backend` when finished.

Report the files changed, the design choice, and the test result.
```

### Presenter talking points

- SWE first reads the route and neighboring tests instead of guessing the API shape.
- It owns implementation and focused tests.
- Its final report is useful evidence, but it is still self-reported and has not been independently reviewed.

Review the diff with the audience, but do not correct any issue manually. The next agent is responsible for finding defects.

## Part 2 - Use QA directly

Start a new chat, select **QA**, and enter:

```prompt
Independently validate the new `author` filter on the backend books endpoint.

Requirements:
- Read the implementation and existing backend tests.
- Verify exact, partial, mixed-case, empty, omitted, and no-match inputs.
- Check whether the filter composes correctly with any existing books query parameters.
- Look for regressions, unsafe type handling, and unexpected response-shape changes.
- Add or improve automated tests when coverage is missing.
- Run `npm run test:backend`.

Report each finding with severity, reproduction steps, expected versus actual behavior, and evidence. End with an overall PASS or FAIL verdict.
```

### Presenter talking points

- QA receives the requirement, not SWE's conclusions, so the review remains independent.
- QA may edit tests, but it should report product defects precisely rather than silently changing implementation behavior.
- A FAIL verdict creates concrete repair instructions for SWE.

If QA reports a failure, return to **SWE** with this prompt:

```prompt
Fix the QA findings below for the backend `author` filter. Keep the public contract and unrelated behavior unchanged, update tests as needed, and run `npm run test:backend`.

QA report:
<paste the QA report here>
```

Then ask QA to validate again. This manual loop previews what RUG automates.

## Part 3 - Let RUG orchestrate the workflow

Reset the repository to a clean demo starting point or use a fresh clone. Start a new chat, select **RUG**, and enter:

```prompt
Add a book category filter across the application.

Requirements:
- The backend books endpoint accepts an optional `category` query parameter.
- Category matching is case-insensitive and preserves existing behavior when omitted.
- The frontend provides an accessible category control and displays the filtered books without a page reload.
- Existing search behavior must continue to work together with category filtering.
- Add backend and frontend test coverage for the new behavior and important edge cases.
- Use the existing React, Redux, Express, Jest, and Cypress patterns in this repository; do not substitute other libraries.
- Validate with `npm run test:backend` and `npm run build:frontend && npm run test:frontend`.

Delegate all implementation to SWE and all independent validation to QA. If QA finds a defect, send the evidence back to SWE and repeat validation until the complete feature passes. Summarize every delegation, retry, file changed, and final test result.
```

### What to point out while RUG runs

1. **Decomposition:** RUG turns the feature into backend, frontend, test, and integration tasks.
2. **Delegation:** RUG sends narrowly scoped implementation work to SWE rather than editing files itself.
3. **Independent checks:** QA reads the resulting code and runs the required tests instead of trusting SWE's completion claim.
4. **Repeat Until Good:** A QA failure becomes evidence in a new SWE task, followed by another QA pass.
5. **Integration verdict:** RUG finishes only after the focused tasks and the full workflow are validated.

## Expected outcome

At the end of the demo:

- The audience has seen SWE used as a focused implementation agent.
- The audience has seen QA used as an independent verification agent.
- The audience has seen RUG coordinate both agents while preserving a compact orchestration context.
- The final RUG response includes delegated tasks, any retry history, changed files, and results from both required test commands.

## Troubleshooting

| Problem | Resolution |
|---|---|
| Custom agents do not appear | Confirm the files are under `.github/agents`, reopen the workspace, and refresh Copilot Chat. |
| RUG edits code itself | Stop the run and confirm **RUG** is selected; its agent definition requires all work to be delegated. |
| An agent uses a different test command | Remind it that repository instructions require `npm run test:backend` and `npm run build:frontend && npm run test:frontend`. |
| Cypress cannot connect to the app | Follow `run-e2e.sh` and the project README prerequisites, then rerun the frontend command. |
| The first two parts leave changes behind | Use a fresh clone or restore only the demo changes before Part 3; do not discard unrelated work. |
