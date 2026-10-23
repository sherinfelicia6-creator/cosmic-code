from tool import extract_problems


def suggest_next_level(solved, attempted, difficulty):
    if attempted == 0:
        return "Start with a few problems to track your progress."

    rate = solved / attempted

    if rate >= 0.8:
        if difficulty == "Easy":
            return "You're making progress! Try Medium problems next."
        elif difficulty == "Medium":
            return "Great work! Consider trying Hard problems."
        return "Excellent effort! Keep challenging yourself."

    return (
        "Keep practising this level. Review difficult "
        "questions and try again at your own pace."
    )


def achievement_summary(solved, attempted, topics=None):
    rate = solved / attempted * 100 if attempted else 0
    topics = topics or []

    message = (
        f"You solved {solved} out of {attempted} problems "
        f"({rate:.0f}% success rate). "
    )

    if solved >= 10:
        message += "Amazing milestone! You've solved 10 or more problems. "
    elif solved > 0:
        message += "Every solved problem is progress. Keep going! "
    else:
        message += "Every expert starts somewhere. Let's solve your first problem! "

    if topics:
        message += "Topics practised: " + ", ".join(topics) + "."

    return message


def create_daily_plan(minutes):
    if minutes <= 0:
        return "Please choose a positive number of minutes."

    if minutes <= 15:
        return (
            "Quick session: review one concept and attempt "
            "one coding problem."
        )
    elif minutes <= 30:
        return (
            "Focused session: review a concept, solve "
            "1-2 problems, and check your mistakes."
        )
    elif minutes <= 60:
        return (
            "Practice session: revise concepts, solve "
            "2-4 suitable problems, and review your solutions."
        )
    else:
        return (
            "Extended session: divide your time between "
            "revision, problem-solving, and reviewing mistakes. "
            "Take breaks when needed."
        )


def update_streak(previous_streak, last_practice_date, today):
    # Dates must use the format YYYY-MM-DD.
    from datetime import date, timedelta

    today = date.fromisoformat(today)

    if last_practice_date is None:
        return 1 if previous_streak == 0 else previous_streak

    last_day = date.fromisoformat(last_practice_date)

    if last_day == today:
        return previous_streak
    elif last_day == today - timedelta(days=1):
        return previous_streak + 1
    else:
        return 1



def run_agent(topic, difficulty, minutes=30,
              solved=0, attempted=0, topics=None):
    allowed = ["Easy", "Medium", "Hard"]

    if difficulty not in allowed:
        return {
            "message": "Please select a valid difficulty.",
            "problems": []
        }

    if minutes <= 0 or attempted < 0 or solved < 0:
        return {
            "message": "Please enter valid progress and time values.",
            "problems": []
        }

    if solved > attempted:
        return {
            "message": "Solved count cannot exceed attempted count.",
            "problems": []
        }

    problems = extract_problems(topic, difficulty)
    problems.sort(key=lambda p: p["rating"])

    return {
        "summary": achievement_summary(solved, attempted, topics),
        "daily_plan": create_daily_plan(minutes),
        "next_level": suggest_next_level(
            solved, attempted, difficulty
        ),
        "message": (
            f"Found {len(problems)} practice problems."
            if problems else
            "No problems found. Try another topic or difficulty."
        ),
        "problems": problems
    }