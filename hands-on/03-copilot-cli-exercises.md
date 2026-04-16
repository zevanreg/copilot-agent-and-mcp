# GitHub Copilot CLI Exercises

> [!NOTE]
> This is a hands-on workshop so it has to be done by the participants. The instructions below are to be used by the workshop participants themselves.

## Prerequisites

- A GitHub account with Copilot enabled (any plan).
- Node.js 16+ installed.
- GitHub Copilot CLI installed and authenticated (see Exercise 6).
> [!IMPORTANT]
> If you receive Copilot through an organization, an admin must first enable the **GitHub Copilot CLI** policy in the organization's settings before the CLI will work.

## Environment configuration

- Create a new repository from [ps-copilot-sandbox/copilot-agent-and-mcp](https://github.com/ps-copilot-sandbox/copilot-agent-and-mcp) which is a template repository, or reuse the repository from a previous exercise.
- Clone the repository on your laptop.
- Use the instructions in the [`README.md` file](/README.md) to set up your development environment.
- All the following instructions have to be done in your terminal.

---

## Exercise 6: Install and Authenticate GitHub Copilot CLI

### Task (Exercise 6)

Install GitHub Copilot CLI and start your first interactive session against this repository.

### Steps (Exercise 6)

1. Install GitHub Copilot CLI using the method that matches your environment:

   **Cross-platform (npm):**
   ```bash
   npm install -g @githubnext/github-copilot-cli
   ```

   **Windows (WinGet):**
   ```powershell
   winget install GitHub.Copilot
   ```

   **macOS / Linux (Homebrew):**
   ```bash
   brew install copilot-cli
   ```

2. Verify the installation:
   ```bash
   copilot --version
   ```

3. Navigate to the project root:
   ```bash
   cd copilot-agent-and-mcp
   ```

4. Start an interactive Copilot CLI session:
   ```bash
   copilot
   ```

5. On first run, type `/login` and follow the device-flow instructions to authenticate with your GitHub account.

6. When asked whether you trust the files in the current directory, select **Yes, proceed**.

7. Run a warm-up question to confirm everything is working:
   ```
   What technology stack does this project use? List the main frameworks 
   and explain why each one was likely chosen.
   ```

8. Explore the token usage with:
   ```
   /context
   ```

### Learning Objectives (Exercise 6)

- Installing and authenticating GitHub Copilot CLI
- Starting an interactive session and understanding trust prompts
- Using `/context` to understand session state

---

## Exercise 7: Explore the Codebase with Copilot CLI

### Task (Exercise 7)

You've just joined the team and need to get up to speed on how the app handles users and data. Use Copilot CLI to audit the project for potential issues and produce a short onboarding brief.

### Steps (Exercise 7)

1. Start a Copilot CLI session from the project root (if not already open):
   ```bash
   copilot
   ```

2. Ask Copilot to map out the backend routes:
   ```
   List all the API routes this backend exposes. For each one, describe 
   what it does, whether it requires authentication, and what it returns.
   ```

3. Focus on the user registration and login logic:
   ```
   How does user registration work? Where is the password stored and is it 
   handled securely?
   ```

4. Look for potential gaps in error handling:
   ```
   Review the backend routes and identify any places where errors are not 
   handled or where a bad request could cause an unhandled exception.
   ```

5. Use non-interactive mode to produce a quick onboarding note:
   ```bash
   copilot -sp "Write a 5-bullet onboarding summary for a new backend engineer joining this project."
   ```

6. Attach the auth route for a focused code review using `@`:
   ```
   @backend/routes/auth.js Review this file for security issues. Flag anything 
   that could be exploited and suggest fixes.
   ```

### Learning Objectives (Exercise 7)

- Using Copilot CLI to audit and understand an unfamiliar codebase
- Combining interactive and non-interactive (`-p`, `-s`) modes
- Attaching local files with `@` for targeted, focused analysis

---

## Exercise 8: Add a Feature Using Plan Mode

### Task (Exercise 8)

Use Copilot CLI's plan mode to add a "recently added" books endpoint to the backend, review the generated plan before any code is written, then let Copilot implement and verify it.

### Steps (Exercise 8)

1. Start a Copilot CLI session from the project root (if not already open):
   ```bash
   copilot
   ```

2. Activate plan mode by pressing **Shift+Tab**, then enter the following prompt:
   ```
   Add a GET /books/recent?limit= endpoint to backend/routes/books.js that returns 
   the last N books added to the collection (default limit: 5, max: 20). 
   Update the tests in backend/tests/books.test.js to cover the new endpoint, 
   including edge cases for missing and out-of-range limit values.
   ```

3. Copilot will:
   - Ask any clarifying questions.
   - Generate a step-by-step checklist and save it to `plan.md`.
   - Wait for your approval before touching any file.

4. Review the plan in `plan.md`. Check that it covers:
   - The new route handler in `books.js`.
   - Default and maximum limit enforcement.
   - New test cases in `books.test.js` for happy path and edge cases.

5. Approve the plan and let Copilot implement the feature.

6. Once implementation is complete, verify the tests pass:
   ```
   Run the backend tests and show me a summary of the results.
   ```
   Copilot runs `npm run test:backend` and reports the outcome.

7. If any tests fail, ask Copilot to investigate and fix them:
   ```
   One or more tests are failing. Diagnose the root cause and fix it 
   without changing the intended behaviour of the endpoint.
   ```

8. As a stretch goal, ask Copilot to add a frontend hook for the new endpoint:
   ```
   How would I call the new /books/recent endpoint from the React frontend? 
   Show me the minimal change needed in the Redux slice.
   ```

### Learning Objectives (Exercise 8)

- Using plan mode (`Shift+Tab`) to review changes before they are made
- Understanding how Copilot CLI decomposes a feature request into steps
- Letting Copilot run tests and iterate on failures autonomously
- Exploring cross-layer implications of a backend change

---

## Exercise 9 (Optional): Work IQ — Surface M365 Context in the Terminal

> [!IMPORTANT]
> This exercise requires a **Microsoft 365 account with Copilot enabled**. If you don't have one, skip to Exercise 10.

### Task (Exercise 9)

Install the Microsoft Work IQ plugin and use it to answer questions about your calendar, emails, and Teams conversations without leaving the terminal.

### Steps (Exercise 9)

1. Start a Copilot CLI session:
   ```bash
   copilot
   ```

2. Register the Microsoft-provided plugin source:
   ```
   /plugin marketplace add github/copilot-plugins
   ```

3. Install the Work IQ plugin:
   ```
   /plugin install workiq@copilot-plugins
   ```

4. Trigger first-time setup by asking a workplace question:
   ```
   How many meetings do I have today?
   ```
   You'll be prompted to accept the EULA and sign in with your Microsoft work account.

5. Once Work IQ is active (you'll see `● WorkIQ is ready`), try the following prompts:
   ```
   What is on my calendar for the rest of this week?
   ```
   ```
   Find any emails or Teams messages I received in the last 7 days that mention 
   a deadline or a deliverable.
   ```
   ```
   What was the last document I edited and what is it about?
   ```

6. Now simulate a realistic work scenario. Imagine your manager sent you an email asking for a code review turnaround before the end of the week. Ask:
   ```
   Search my recent emails for any messages from my manager about code review 
   or pull requests. Summarize the request and the deadline.
   ```
   Then connect it to your calendar:
   ```
   Based on my calendar for this week, when is the best time to block off an 
   hour for the code review?
   ```
   Finally, draft a reply:
   ```
   Draft a short email reply confirming I will have the review done by the 
   deadline mentioned. Keep it professional and under 50 words.
   ```

### Learning Objectives (Exercise 9)

- Installing and configuring the Work IQ plugin
- Grounding Copilot CLI responses in real Microsoft 365 context
- Combining workplace data with codebase reasoning in a single session

---

## Exercise 10 (Optional): Deploy to Azure with /fleet + Azure MCP Server

> [!IMPORTANT]
> This exercise requires an **active Azure subscription** and the Azure CLI installed and authenticated (`az login`).

### Task (Exercise 10)

Register the Azure MCP Server inside your Copilot CLI session and use `/fleet` to deploy the project backend to Azure App Service.

### Steps (Exercise 10)

1. In a separate terminal, authenticate with Azure:
   ```bash
   az login
   ```

2. Start a Copilot CLI session:
   ```bash
   copilot
   ```

3. Register the Azure MCP Server:
   ```
   /mcp add azure npx -y @azure/mcp@latest server start
   ```

4. Verify the Azure tools loaded:
   ```
   /context
   ```
   You should see `azure` listed under active MCP servers.

5. Explore your Azure environment:
   ```
   List my Azure resource groups and App Service plans.
   ```

6. Before deploying, ask Copilot to recommend the best Azure region for your location:
   ```
   Which Azure region would give me the lowest latency from <your-city>? 
   What App Service SKU would you recommend for a demo workload?
   ```

7. Use `/fleet` to orchestrate the full deployment. Replace `<your-region>` with the region from the previous step:
   ```
   /fleet Deploy this Node.js backend to Azure App Service.
   The backend code is in ./backend and the server listens on port 3000.
   Use resource group: rg-cli-lab-<your-initials>, region: <your-region>.
   Create the resource group if it does not exist.
   Use a free-tier App Service Plan.
   ```

8. Monitor the sub-agent output as each deployment stage completes.

9. Once finished, verify the deployment:
   ```
   Get the hostname and deployment status of the web app 
   in resource group rg-cli-lab-<your-initials>.
   ```

10. Open the returned URL in your browser and confirm the backend responds.

11. Ask Copilot what it would take to make this production-ready:
    ```
    The app is now deployed. What additional steps would I need to take to 
    make it production-ready on Azure? Think about security, scaling, and monitoring.
    ```

12. **Clean up** to avoid charges — ask Copilot to delete the resources:
    ```
    Delete the resource group rg-cli-lab-<your-initials> and all resources inside it.
    ```

### Learning Objectives (Exercise 10)

- Adding an MCP server to a Copilot CLI session with `/mcp add`
- Using the Azure MCP Server to query real Azure resources
- Orchestrating multi-step cloud deployments with `/fleet`
- Understanding how Copilot coordinates parallel sub-agents
