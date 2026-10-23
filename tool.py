import requests

API_URL = "https://codeforces.com/api/problemset.problems"

DIFFICULTY_RANGES = {
    "Easy": (800, 1100),
    "Medium": (1200, 1600),
    "Hard": (1700, 2200)
}


def extract_problems(topic="implementation", difficulty="Easy"):
    """Fetch and filter Codeforces problems by topic and difficulty."""

    if difficulty not in DIFFICULTY_RANGES:
        return []

    try:
        response = requests.get(
            API_URL,
            params={"tags": topic},
            timeout=15
        )
        response.raise_for_status()

        data = response.json()

        if data.get("status") != "OK":
            return []

        problems = data.get("result", {}).get("problems", [])
        minimum, maximum = DIFFICULTY_RANGES[difficulty]

        results = []

        for problem in problems:
            rating = problem.get("rating")
            contest_id = problem.get("contestId")
            index = problem.get("index")
            name = problem.get("name")

            # Skip problems with missing required information.
            if (
                rating is None
                or contest_id is None
                or index is None
                or not name
            ):
                continue

            if minimum <= rating <= maximum:
                results.append({
                    "title": name,
                    "topic": ", ".join(problem.get("tags", [])),
                    "rating": rating,
                    "difficulty": difficulty,
                    "url": (
                        f"https://codeforces.com/problemset/"
                        f"problem/{contest_id}/{index}"
                    )
                })

        # Display lower-rated problems first.
        results.sort(key=lambda problem: problem["rating"])

        return results[:10]

    except requests.Timeout:
        print("Codeforces API request timed out.")
        return []

    except requests.RequestException as error:
        print(f"Codeforces API request failed: {error}")
        return []

    except (ValueError, KeyError, TypeError) as error:
        print(f"Could not process Codeforces API response: {error}")
        return []


def get_daily_message(minutes):
    """Provide a practice suggestion based on available time."""

    try:
        minutes = int(minutes)
    except (TypeError, ValueError):
        return "Please enter a valid number of practice minutes."

    if minutes <= 0:
        return "Choose a valid practice time."

    if minutes <= 15:
        return "A little practice counts! Try one coding problem today."

    elif minutes <= 30:
        return "Great plan! Review a concept and solve 1-2 problems."

    elif minutes <= 60:
        return "You've set aside focused time. Practise and review mistakes."

    else:
        return (
            "Plan a longer session with breaks and time for revision."
        )