from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# -----------------------------
# 1️⃣ Define all roadmaps here
# -----------------------------
roadmaps = {
    "python": [
        {"title": "Setup & Basics", "description": "Install Python, learn syntax, variables, and data types."},
        {"title": "Control Flow", "description": "Master if-else, loops, and functions to control program flow."},
        {"title": "Data Structures", "description": "Learn lists, tuples, dictionaries, sets, and their use cases."},
        {"title": "Projects & Practice", "description": "Build small projects like calculators or to-do apps."},
        {"title": "Advanced Concepts", "description": "Dive into OOP, modules, file handling, and error handling."},
        {"title": "Final Challenge", "description": "Create a mini project combining everything you learned."}
    ],
    "java": [
        {"title": "Setup & Basics", "description": "Install JDK, learn syntax, variables, and simple programs."},
        {"title": "OOP Concepts", "description": "Learn classes, objects, inheritance, and polymorphism."},
        {"title": "Collections", "description": "Master arrays, ArrayList, HashMap, and iteration."},
        {"title": "Projects & Practice", "description": "Build small console projects to apply concepts."},
        {"title": "Advanced Topics", "description": "Explore multithreading, exceptions, and file handling."},
        {"title": "Final Challenge", "description": "Build a mini app that uses core Java concepts."}
    ],
    "dsa": [
        {"title": "Basics", "description": "Understand arrays, strings, and basic complexity analysis."},
        {"title": "Linked Structures", "description": "Learn linked lists, stacks, queues, and their implementation."},
        {"title": "Sorting & Searching", "description": "Implement sorting algorithms and binary search."},
        {"title": "Trees & Graphs", "description": "Study trees, binary search trees, graphs, and traversals."},
        {"title": "Advanced DSA", "description": "Dynamic programming, recursion, and problem-solving patterns."},
        {"title": "Final Challenge", "description": "Solve a comprehensive problem combining all topics."}
    ]
}

# -----------------------------
# 2️⃣ Generate roadmap based on hours
# -----------------------------
def generate_roadmap(topic, hours):
    topic = topic.lower()
    
    if topic not in roadmaps:
        return [{"title": "Not Found", "description": "Sorry, we don't have a roadmap for this topic yet."}]
    
    steps = roadmaps[topic]
    total_steps = len(steps)

    # Dynamic step calculation: 2 hours = 1 step (adjustable)
    steps_to_show = min(total_steps, max(1, hours // 2))

    progressive_roadmap = []
    for i in range(steps_to_show):
        step = steps[i].copy()
        step["progress"] = f"Step {i+1} of {total_steps}"
        progressive_roadmap.append(step)
    
    return progressive_roadmap

# -----------------------------
# 3️⃣ API endpoint
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    topic = data.get("topic", "")
    hours = int(data.get("hours", 2))
    
    roadmap = generate_roadmap(topic, hours)
    return jsonify({"topic": topic, "roadmap": roadmap})

# -----------------------------
# 4️⃣ Run Flask server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)
