"""
journey.py - Journey construction, scoring, and ranking.

A Journey is an ordered sequence of Segments forming a complete path.
The scoring module evaluates journeys across three preference modes:
  - cheapest  -> rank by total_cost  (ascending)
  - fastest   -> rank by total_time  (ascending)
  - fewest    -> rank by num_hops    (ascending)
"""


class Journey:
    """Represents a complete path from origin to destination."""

    def __init__(self, segments, network):
        self.segments = segments            # list of Segment objects
        self.network = network
        self.total_cost = sum(s.cost for s in segments)
        self.total_time = sum(s.duration for s in segments)
        self.num_hops = len(segments)

        # Build the stop sequence for display
        if segments:
            self.stop_ids = [segments[0].from_stop] + [s.to_stop for s in segments]
        else:
            self.stop_ids = []

    def stop_names(self):
        return [self.network.get_stop_name(sid) for sid in self.stop_ids]

    def mode_sequence(self):
        return [s.mode for s in self.segments]

    def summary_dict(self):
        """Return a dict summarising this journey for display."""
        return {
            "stops": self.stop_names(),
            "modes": self.mode_sequence(),
            "total_cost": self.total_cost,
            "total_time": self.total_time,
            "num_hops": self.num_hops,
            "segments": self.segments,
        }


# ---- Scoring & Ranking ----

PREFERENCE_KEYS = {
    "cheapest": "total_cost",
    "fastest": "total_time",
    "fewest": "num_hops",
}


def rank_journeys(journeys, preference):
    """
    Sort journeys by the chosen preference mode (ascending).
    Returns a new sorted list.

    Scoring logic (transparent):
      cheapest -> sort by total_cost
      fastest  -> sort by total_time
      fewest   -> sort by num_hops
    """
    key = PREFERENCE_KEYS.get(preference, "total_cost")
    return sorted(journeys, key=lambda j: getattr(j, key))


def normalise(values):
    """Min-max normalise a list of numbers to [0, 1]."""
    lo, hi = min(values), max(values)
    if hi == lo:
        return [0.0] * len(values)
    return [(v - lo) / (hi - lo) for v in values]


def rank_journeys_multi(journeys, preferences, weights=None):
    """
    Rank journeys by multiple preference modes combined.

    Each selected preference is normalised to [0, 1] and then combined
    using equal (or user-supplied) weights. Lower combined score = better.

    Scoring formula (transparent):
      score(j) = w1 * norm(metric1) + w2 * norm(metric2) + ...

    Returns (sorted_journeys, scores_list) so the UI can display
    the composite breakdown.
    """
    if weights is None:
        weights = {p: 1.0 / len(preferences) for p in preferences}

    # Gather raw values per preference
    raw = {}
    normed = {}
    for pref in preferences:
        key = PREFERENCE_KEYS[pref]
        raw[pref] = [getattr(j, key) for j in journeys]
        normed[pref] = normalise(raw[pref])

    # Compute composite score for each journey
    scores = []
    for i in range(len(journeys)):
        s = sum(weights[pref] * normed[pref][i] for pref in preferences)
        scores.append(s)

    # Pair journeys with their scores and sort
    paired = list(zip(journeys, scores))
    paired.sort(key=lambda x: x[1])

    sorted_journeys = [p[0] for p in paired]
    sorted_scores = [p[1] for p in paired]

    # Build per-journey breakdown for transparency
    breakdowns = []
    for i, j in enumerate(journeys):
        bd = {}
        for pref in preferences:
            key = PREFERENCE_KEYS[pref]
            bd[pref] = {
                "raw": getattr(j, key),
                "normalised": normed[pref][i],
                "weight": weights[pref],
                "weighted": weights[pref] * normed[pref][i],
            }
        breakdowns.append(bd)

    # Reorder breakdowns to match sorted order
    idx_order = [x[0] for x in sorted(enumerate(scores), key=lambda x: x[1])]
    sorted_breakdowns = [breakdowns[i] for i in idx_order]

    return sorted_journeys, sorted_scores, sorted_breakdowns


def build_journeys(paths, network):
    """Convert raw DFS paths (lists of Segments) into Journey objects."""
    return [Journey(p, network) for p in paths]
