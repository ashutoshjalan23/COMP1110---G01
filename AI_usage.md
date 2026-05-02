# AI Tool Usage Log

## Usage Summary

| Date | Feature/File | Task | AI Tool | Description | Name |
|------|-------------|------|---------|-------------|---------|
| 2026-05-01 | Guideline audit, edge-case hardening, tests, documentation | Review COMP1110 compliance, run stress tests, and patch validation gaps | OpenAI Codex (GPT-5) | Prompt used: "check if the project follows full guidelines, perform a stress test and make sure no edge cases are left untouched, make sure the project guidelines are being implemented 1:1 in the code" | Aikagra Gupta |
| 2026-05-01 | README, frontend naming, Vercel deployment configuration | Clean stale frontend naming, align README with the repo, and deploy the frontend | OpenAI Codex (GPT-5) | Prompt used: "make the AI usage entries detailed and fix the readme, change the vercel deployment link to a simpler name, open transit, deploy it, change the folder from spline ui to something else because we dont use it in vercel, add it in the readme, and fix the readme remove anything that is not in the project and check if it matches everything 1:1 in the project, there shouldn't be any problems with that, i believe we dont use spline as well in the project" | Aikagra Gupta |
| 2026-05-02 | Network summary, backend API, frontend summary panel, tests | Add network summary metrics to the CLI, API, deployed backend, frontend, README, and tests | OpenAI Codex (GPT-5) | Prompt used: "add a network summary functionality as well Number of stops Number of segments Average time to commute Average cost Ye 4 defial" | Aikagra Gupta |
| 2026-04-12 | DFS implementation scaffolding | Implement a depth-limited DFS for a directed graph represented as an adjacency list in Python | Claude Code (Sonnet 4.6) | AI generated initial DFS skeleton; I modified the visited-set logic, depth parameter, and path-building to match the Stop/Segment data model | Ashutosh Jalan |
| 2026-04-12 | Live API helper structure (`check.py`) | Write Python functions to call the MTR ETA API and KMB open-data API with error handling and fallback | Claude Code (Sonnet 4.6) | AI produced function stubs; I verified response field names against live API documentation and added TDAS traffic lookup and geocoding | Ashutosh Jalan |
| 2026-04-12 | Next.js frontend component scaffolding | Create a Next.js map component using Leaflet that displays markers from a JSON array of stops | Claude Code (Sonnet 4.6) | AI generated MapClient boilerplate; I integrated backend data fetching, route highlighting, and the journey/ETA panel state | Ashutosh Jalan |
| 2026-05-01 | `AI_usage.md` initial creation | Create an AI usage disclosure log in markdown table format listing date, task, prompt, and description columns | Claude Code (Sonnet 4.6) | AI generated the markdown template; I populated all entries with accurate dates, prompts, and descriptions of modifications | Ashutosh Jalan |
| 2026-05-02 | Self-evaluation usage table | Create a word table which I can put in my self evaluation report for this COMP1110 | Claude Code (Sonnet 4.6) | AI generated the formatted usage table for the self-evaluation report | Ashutosh Jalan |
| 2026-05-01 | `tests/test_*.py` | Updated test files from tests.zip with proper sys.path imports and verbosity | Gemini (Antigravity - Claude Opus 4.6 Thinking) | Prompt used: `access the tests zip folder in HKU folder - sem 2 - comp 1110 - then do changes` | Shikhar Mathur |
| 2026-05-01 | `tests/test_*.py` | Added descriptive input/output logging to all test files showing inputs passed and outputs received | Gemini (Antigravity - Claude Opus 4.6 Thinking) | Prompt used: `in the test files currently the output just shows that the function is working, make it more descriptive to show what inputs were passed and whats outputs are being received` | Shikhar Mathur |
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
- **Feature/File**: `README.md`, `AI_usage.md`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/README.md`, `frontend/app/layout.tsx`, `frontend/app/page.tsx`, `frontend/app/components/JourneyPanel.tsx`
- **AI Tool Used**: OpenAI Codex (GPT-5)
- **Task**: Make the AI usage entries more detailed, remove stale project names, rename the frontend/Vercel identity to `open-transit`, and deploy the frontend.
- **Prompt Used**: "make the AI usage entries detailed and fix the readme, change the vercel deployment link to a simpler name, open transit, deploy it, change the folder from spline ui to something else because we dont use it in vercel, add it in the readme, and fix the readme remove anything that is not in the project and check if it matches everything 1:1 in the project, there shouldn't be any problems with that, i believe we dont use spline as well in the project"
- **Description**: The AI audited the README against the current repository layout, cleaned stale frontend naming, updated display names, relinked the Vercel project, corrected the Vercel framework preset to Next.js, and prepared the production deployment link.
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
- **Date**: 2026-04-12
- **Name**: Ashutosh Jalan
- **Feature/File**: `journey.py`, `network.py`
- **AI Tool Used**: Claude Code (Sonnet 4.6)
- **Task**: Implement a depth-limited DFS for a directed graph represented as an adjacency list in Python.
- **Prompt Used**: "Implement a depth-limited DFS for a directed graph represented as an adjacency list in Python"
- **Description**: AI generated initial DFS skeleton; I modified the visited-set logic, depth parameter, and path-building to match the Stop/Segment data model.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 5
- **Date**: 2026-04-12
- **Name**: Ashutosh Jalan
- **Feature/File**: `check.py`
- **AI Tool Used**: Claude Code (Sonnet 4.6)
- **Task**: Write Python functions to call the MTR ETA API and KMB open-data API with error handling and fallback.
- **Prompt Used**: "Write Python functions to call the MTR ETA API and KMB open-data API with error handling and fallback"
- **Description**: AI produced function stubs; I verified response field names against live API documentation and added TDAS traffic lookup and geocoding.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 6
- **Date**: 2026-04-12
- **Name**: Ashutosh Jalan
- **Feature/File**: `frontend/app/components/MapClient.tsx`
- **AI Tool Used**: Claude Code (Sonnet 4.6)
- **Task**: Create a Next.js map component using Leaflet that displays markers from a JSON array of stops.
- **Prompt Used**: "Create a Next.js map component using Leaflet that displays markers from a JSON array of stops"
- **Description**: AI generated MapClient boilerplate; I integrated backend data fetching, route highlighting, and the journey/ETA panel state.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 7
- **Date**: 2026-05-01
- **Name**: Ashutosh Jalan
- **Feature/File**: `AI_usage.md`
- **AI Tool Used**: Claude Code (Sonnet 4.6)
- **Task**: Create an AI usage disclosure log in markdown table format listing date, task, prompt, and description columns.
- **Prompt Used**: "Create an AI usage disclosure log in markdown table format listing date, task, prompt, and description columns"
- **Description**: AI generated the markdown template; I populated all entries with accurate dates, prompts, and descriptions of modifications.
- **Code Generated**: Partial
- **Code Modified After**: Yes

### Entry 8
- **Date**: 2026-05-02
- **Name**: Ashutosh Jalan
- **Feature/File**: Self-evaluation report
- **AI Tool Used**: Claude Code (Sonnet 4.6)
- **Task**: Create a formatted usage table for the self-evaluation report.
- **Prompt Used**: "Create a word table which I can put in my self evaluation report for this COMP1110"
- **Description**: AI generated the formatted usage table for the self-evaluation report.
- **Code Generated**: No
- **Code Modified After**: No

### Entry 10
- **Date**: 2026-05-01
- **Name**: Shikhar Mathur
- **Feature/File**: `tests/test_backend_api.py`, `tests/test_file_io.py`, `tests/test_journey.py`, `tests/test_network.py`
- **AI Tool Used**: Gemini (Antigravity - Claude Opus 4.6 Thinking)
- **Task**: Extract test files from the provided tests.zip and update the repository test suite with proper path imports so tests run correctly from the tests/ subdirectory.
- **Prompt Used**: `access the tests zip folder in HKU folder - sem 2 - comp 1110 - then do changes`
- **Description**: The AI extracted tests.zip, compared its contents with the existing test files in the repo, identified the differences (missing sys.path.insert for subdirectory imports and missing verbosity=2), and copied the updated test files into the repository's tests/ folder.
- **Code Generated**: Partial
- **Code Modified After**: No

### Entry 11
- **Date**: 2026-05-01
- **Name**: Shikhar Mathur
- **Feature/File**: `tests/test_backend_api.py`, `tests/test_file_io.py`, `tests/test_journey.py`, `tests/test_network.py`
- **AI Tool Used**: Gemini (Antigravity - Claude Opus 4.6 Thinking)
- **Task**: Enhance all test files with descriptive print statements that show what inputs are being passed to each function and what outputs are being received, making test output more informative.
- **Prompt Used**: `in the test files currently the output just shows that the function is working, make it more descriptive to show what inputs were passed and whats outputs are being received`
- **Description**: The AI read all four test files and the source modules (network.py, journey.py, file_io.py, backend_api.py) to understand the function signatures. It then added detailed print statements to every test method showing: the function being called, the input parameters, the actual output values, the expected values, and PASS/FAIL status. All 16 tests were verified passing with the new descriptive output.
- **Code Generated**: Yes
- **Code Modified After**: Yes (fixed one key name from 'seg_id' to 'segId' to match the serialised API response format)
