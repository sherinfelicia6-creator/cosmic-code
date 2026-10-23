from flask import Flask, request, render_template
from agent import run_agent
from tool import extract_problems
app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def home():
    problems = []
    message = ""

    if request.method == "POST":
        topic = request.form.get("topic", "implementation")
        difficulty = request.form.get("difficulty", "Easy")

        try:
            result = run_agent(topic, difficulty)
            problems = result.get("problems", [])
            message = result.get("message", "")
        except Exception as error:
            message = f"Unable to generate problems: {error}"

    return render_template(
        "index.html",
        problems=problems,
        message=message
    )


if __name__ == "__main__":
    app.run(debug=True)