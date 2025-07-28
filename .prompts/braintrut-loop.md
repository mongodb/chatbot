# Braintrust Evaluation Refinement Loop

This document explains how to use the Braintrust MCP server to iteratively improve your prompts, datasets and evals.

The Loop is as follows:

1. Run an eval experiment
2. Get the results with `get-experiment-results` MCP tool.
3. Interpret the results
4. Optimize the experiment (with the code editor)
5. Repeat. Ask for additional info from the user if relevant or requested.

More details in the below [Workflow Loop](#workflow-loop) section.

## Required Info

Before starting the loop, you need the following:

1. The Braintrust MCP server added
2. A target eval file to run against
3. Any additional user-provided info, such as what they're trying to optimize against.

If  the user-provided info is not clear, ask for clarification.

If the user-provided info specifies doing something not in the "Workflow Loop" section, defer to the user's preferences.

## Workflow Loop 

### 1. Run Eval Experiment

This project features some eval files, all named like `*.eval.ts`.
You can run them with `cd packages/<relevant-package>/ && npx tsx <eval-file-name>.eval.ts`.

This kicks of the evaluation, sending data to the Braintrust platform. When the operation is complete, you will receive a URL to view the results and an overview of the results.

### 2. Get Experiment Results

Use the Braintrust MCP's `get-experiment-results` tool to view the experiment results.

### 3. Interpret Experiment Results

Use the data returned to the terminal from running the eval to interpret the results.

In your interpretation, do the following:

1. Summarize the results at a high level.
2. Identify any patterns or trends in the results.
3. Identify areas for improvement. This could be things like:
   - Improving the prompt
   - Adding additional eval cases to the dataset
   - Modifying eval cases in the dataset
   - Debugging eval scorers

### 4. Optimize Experiment

Based on your interpretation of the results, optimize the experiment. 

Use your built-in code editing tools to do this.

Report on the changes you make to the user.

### 5. Repeat

Repeat the loop until either you or the user is satisfied with the results.

This can be a good point to ask for additional info from the user if relevant or requested.
