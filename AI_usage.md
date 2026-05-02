# AI Tool Usage Log

## Overview
This document tracks the use of AI tools (GitHub Copilot, Claude, etc.) in this project for transparency and academic integrity.

---

## Usage Summary

| Date | Feature/File | Task | AI Tool | Description | Name |
|------|-------------|------|---------|-------------|---------|
| 2026-05-01 | Guideline audit, edge-case hardening, tests, documentation | Review COMP1110 compliance, run stress tests, and patch validation gaps | OpenAI Codex (GPT-5) | Prompt used: "check if the project follows full guidelines, perform a stress test and make sure no edge cases are left untouched, make sure the project guidelines are being implemented 1:1 in the code" | Aikagra Gupta |
| 2026-05-01 | README, frontend naming, Vercel deployment configuration | Rename old `spline-ui` references to `open-transit`, align README with the actual repo, and deploy the frontend | OpenAI Codex (GPT-5) | Prompt used: "make the AI usage entries detailed and fix the readme, change the vercel deployment link to a simpler name, open transit, deploy it, change the folder from spline ui to something else because we dont use it in vercel, add it in the readme, and fix the readme remove anything that is not in the project and check if it matches everything 1:1 in the project, there shouldn't be any problems with that, i believe we dont use spline as well in the project" | Aikagra Gupta |
| 2026-05-02 | Network summary, backend API, frontend summary panel, tests | Add network summary metrics to the CLI, API, deployed backend, frontend, README, and tests | OpenAI Codex (GPT-5) | Prompt used: "add a network summary functionality as well Number of stops Number of segments Average time to commute Average cost Ye 4 defial" | Aikagra Gupta |
| 2026-05-01 | Guideline audit, edge-case hardening, tests, documentation | Review COMP1110 compliance, run stress tests, and patch validation gaps | Claude Code (Opus 4.6) | Prompt used: "check if the project follows full guidelines, perform a stress test and make sure no edge cases are left untouched, make sure the project guidelines are being implemented 1:1 in the code" | Ashutosh Jalan |
| 2026-04-17 | frontend | UI implementation  | Claude Code (Opus 4.6) | Prompt used: "Create UI using next.js framework for our python based Smart Transport Public Advisor. Ensure that it connects with python backend properly and uses live ETA as well. Create a proper map based layout for stops/segments we have in our data " | Ashutosh Jalan |
| 2026-05-01 | 	ests/test_*.py | Updated test files from tests.zip with proper sys.path imports and verbosity | Gemini (Antigravity - Claude Opus 4.6 Thinking) | Prompt used: `access the tests zip folder in HKU folder - sem 2 - comp 1110 - then do changes` | Shikhar Mathur |
| 2026-05-01 | 	ests/test_*.py | Added descriptive input/output logging to all test files showing inputs passed and outputs received | Gemini (Antigravity - Claude Opus 4.6 Thinking) | Prompt used: `in the test files currently the output just shows that the function is working, make it more descriptive to show what inputs were passed and whats outputs are being received` | Shikhar Mathur |
---

## Detailed Entries

### Entry 1
- **Date**: 2026-05-01
- **Name**: Aikagra Gupta
- **Feature/File**: `file_io.py`, `journey.py`, `tests/test_guideline_edge_cases.py`, `README.md`, `CASE_STUDIES.md`, `GUIDELINE_COVERAGE.md`, `frontend/app/components/MapClient.tsx`
- **AI Tool Used**: OpenAI Codex (GPT-5)
- **Task**: Check the COMP1110 Topic B project against the full project guidelines, stress-test edge cases, and fix identified gaps.
- **Prompt Used**: "check if the project follows full guidelines, perform a stress test and make sure no edge cases are left untouched, make sure the project guidelines are being implemented 1:1 in the code"
- **Description**: The AI reviewed the project guidelines and repository, added CSV and preference validation, added stress tests, fixed a frontend lint typing issue, updated project documentation, pulled the latest remote branch, and reran verification.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 2
- **Date**: 2026-05-01
- **Name**: Aikagra Gupta
- **Feature/File**: `README.md`, `AI_usage.md`, `.claude/settings.local.json`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/README.md`, `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/components/JourneyPanel.tsx`
- **AI Tool Used**: OpenAI Codex (GPT-5)
- **Task**: Make the AI usage entries more detailed, remove stale project names, rename the frontend/Vercel identity to `open-transit`, and deploy the frontend.
- **Prompt Used**: "make the AI usage entries detailed and fix the readme, change the vercel deployment link to a simpler name, open transit, deploy it, change the folder from spline ui to something else because we dont use it in vercel, add it in the readme, and fix the readme remove anything that is not in the project and check if it matches everything 1:1 in the project, there shouldn't be any problems with that, i believe we dont use spline as well in the project"
- **Description**: The AI audited the README against the current repository layout, replaced stale `spline-ui` branding with `open-transit`, updated frontend display names, relinked the Vercel project, corrected the Vercel framework preset to Next.js, and prepared the production deployment link.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 3
- **Date**: 2026-05-02
- **Name**: Aikagra Gupta
- **Feature/File**: `network.py`, `main.py`, `backend_api.py`, `tests/test_backend_api.py`, `tests/test_guideline_edge_cases.py`, `frontend/app/lib/types.ts`, `frontend/app/page.tsx`, backend deployment repo
- **AI Tool Used**: OpenAI Codex (GPT-5)
- **Task**: Add a network summary feature covering number of stops, number of segments, average commute time, and average cost.
- **Prompt Used**: "add a network summary functionality as well Number of stops Number of segments Average time to commute Average cost Ye 4 defial"
- **Description**: The AI added a shared `Network.summary()` method, exposed the summary through `/network` and a dedicated `/summary` endpoint, displayed the four metrics in the terminal network map and the web map overlay, mirrored the API changes in the backend deployment repository, updated README endpoint documentation, and added regression tests for empty and real datasets.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 4
- **Date**: 2026-05-01
- **Name**: Ashutosh Jalan
- **Feature/File**: guideline audit, edge-case hardening, tests, and documentation
- **AI Tool Used**: Claude Code (Opus 4.6)
- **Task**: Review whether the COMP1110 project follows the full guidelines, run stress tests, and identify or fix uncovered edge cases.
- **Prompt Used**: "check if the project follows full guidelines, perform a stress test and make sure no edge cases are left untouched, make sure the project guidelines are being implemented 1:1 in the code"
- **Description**: Claude Code was used to support the guideline-compliance workflow: checking the project against the COMP1110 Topic B requirements, reviewing edge cases, and improving documentation/testing coverage where needed.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 5
- **Date**: 2026-04-17
- **Name**: Ashutosh Jalan
- **Feature/File**: `frontend/`
- **AI Tool Used**: Claude Code (Opus 4.6)
- **Task**: Build the Next.js visual frontend for the Python Smart Public Transport Advisor and connect it to the Python backend.
- **Prompt Used**: "Create UI using next.js framework for our python based Smart Transport Public Advisor. Ensure that it connects with python backend properly and uses live ETA as well. Create a proper map based layout for stops/segments we have in our data "
- **Description**: Claude Code helped create the map-based frontend, including route-planning controls, backend API integration, live ETA display, and visualization of the CSV stop/segment network.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 6
- **Date**: 2026-05-01
- **Name**: Shikhar Mathur
- **Feature/File**: `tests/test_backend_api.py`, `tests/test_file_io.py`, `tests/test_journey.py`, `tests/test_network.py`
- **AI Tool Used**: Gemini (Antigravity - Claude Opus 4.6 Thinking)
- **Task**: Extract test files from the provided tests.zip and update the repository test suite with proper path imports so tests run correctly from the tests/ subdirectory.
- **Prompt Used**: `access the tests zip folder in HKU folder - sem 2 - comp 1110 - then do changes`
- **Description**: The AI extracted tests.zip, compared its contents with the existing test files in the repo, identified the differences (missing sys.path.insert for subdirectory imports and missing verbosity=2), and copied the updated test files into the repository's tests/ folder.
- **Code Generated**: Partial
- **Code Modified After**: No

### Entry 7
- **Date**: 2026-05-01
- **Name**: Shikhar Mathur
- **Feature/File**: `tests/test_backend_api.py`, `tests/test_file_io.py`, `tests/test_journey.py`, `tests/test_network.py`
- **AI Tool Used**: Gemini (Antigravity - Claude Opus 4.6 Thinking)
- **Task**: Enhance all test files with descriptive print statements that show what inputs are being passed to each function and what outputs are being received, making test output more informative.
- **Prompt Used**: `in the test files currently the output just shows that the function is working, make it more descriptive to show what inputs were passed and whats outputs are being received`
- **Description**: The AI read all four test files and the source modules (network.py, journey.py, file_io.py, backend_api.py) to understand the function signatures. It then added detailed print statements to every test method showing: the function being called, the input parameters, the actual output values, the expected values, and PASS/FAIL status. All 16 tests were verified passing with the new descriptive output.
- **Code Generated**: Yes
- **Code Modified After**: Yes (fixed one key name from 'seg_id' to 'segId' to match the serialised API response format)
---

## Guidelines

- **Full disclosure**: Record all AI tool usage, including minor assists
- **Task clarity**: Describe what the AI helped with (e.g., "debugging", "code generation", "explanation")
- **Honesty**: Note if AI-generated code was used as-is or modified
- **Code Generated vs. Modified**: Specify whether AI output was accepted directly or substantially changed

---

## Notes

- This log is maintained for academic integrity purposes
- AI tools can assist but should not replace understanding
- All submitted work remains the student's responsibility
