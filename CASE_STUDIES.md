# Case Studies

These scenarios can be run from `python main.py` using menu option `4`.

## Case 1: Budget Student

- Goal: find a low-cost commute from HKU to Sha Tin.
- Origin: `S11` HKU
- Destination: `S10` Sha Tin
- Preference: `cheapest`
- Expected evidence: compare top routes by fare, time, and hops.

## Case 2: Rush-Hour Commuter

- Goal: find the fastest route from Tsim Sha Tsui to Causeway Bay.
- Origin: `S05` Tsim Sha Tsui
- Destination: `S04` Causeway Bay
- Preference: `fastest`
- Expected evidence: compare direct and transfer routes by travel time.

## Case 3: Tourist With Luggage

- Goal: avoid unnecessary transfers when travelling from Kennedy Town to Mong Kok.
- Origin: `S12` Kennedy Town
- Destination: `S07` Mong Kok
- Preference: `fewest`
- Expected evidence: compare routes by effective hop count.

## Case 4: Weekend Explorer

- Goal: find a low-cost cross-harbour trip from North Point to Tsuen Wan.
- Origin: `S13` North Point
- Destination: `S15` Tsuen Wan
- Preference: `cheapest`
- Expected evidence: compare ferry, bus, minibus, and MTR combinations.

## Evaluation Notes

- Strength: the system is transparent. Each candidate journey is shown with its route, modes, cost, time, and hop count.
- Strength: the implementation is intentionally simple, matching the course expectation that mathematical optimality is not required.
- Limitation: DFS uses the provided network and a depth limit, so missing or unrealistic CSV segments can change the results.
- Limitation: live ETA data depends on external APIs and falls back to static assumptions when unavailable.

