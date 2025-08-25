# app.py
from flask import Flask, request, jsonify, session, Response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_session import Session
from werkzeug.security import generate_password_hash, check_password_hash
import json
import uuid
import os
import zipfile
import io

# --- App Configuration ---
app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_super_secret_key_change_this_for_production'

# --- Session Configuration ---
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = False
app.config['SESSION_USE_SIGNER'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

Session(app)

CORS(app, origins=["http://localhost:3000"], supports_credentials=True)

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:viswa792@localhost/UN'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(150), nullable=False)
    status = db.Column(db.String(20), default='unclaimed')
    created_by_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    claimed_by_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    colab_content = db.Column(db.Text, nullable=True)
    review_comments = db.Column(db.Text, nullable=True)

    created_by = db.relationship('User', foreign_keys=[created_by_id])
    claimed_by = db.relationship('User', foreign_keys=[claimed_by_id])
    # Add cascade delete for cells
    cells = db.relationship('TaskCell', backref='task', cascade="all, delete-orphan")


class TaskCell(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.String(36), db.ForeignKey('task.id'), nullable=False)
    cell_order = db.Column(db.Integer, nullable=False)
    cell_type = db.Column(db.String(50), nullable=False)
    content = db.Column(db.Text, nullable=False)


# --- Helper Function ---
def generate_colab_json(title, cells_data):
    """Generates the JSON content for a Colab notebook."""
    notebook_content = {
        "nbformat": 4,
        "nbformat_minor": 0,
        "metadata": {},
        "cells": []
    }

    if not cells_data:
        notebook_content["cells"].append({
            "cell_type": "markdown",
            "metadata": {},
            "source": [f"# Task ID: {title}"]
        })
    else:
        for cell in cells_data:
            cell_type = cell['cell_type']
            content = cell['content']
            header = ""
            formatted_content = ""

            try:
                # Content can be a simple string or a JSON string for complex cells
                cell_content_data = json.loads(content)
            except (json.JSONDecodeError, TypeError):
                cell_content_data = content  # It's just a plain string

            if cell_type == 'system_prompt':
                header = "[SYSTEM]\n----\n"
                formatted_content = content
            elif cell_type == 'tool_definition':
                header = "[TOOLS]\n----\n"
                # The content is a JSON string of a list of tools
                tools_list = json.loads(content)
                # We need to format this list into the final structure
                final_tools = [{"type": "function", "function": tool} for tool in tools_list]
                formatted_content = f"```json\n{json.dumps(final_tools, indent=2)}\n```"
            elif cell_type == 'user':
                header = "[USER]\n"
                formatted_content = content
            elif cell_type == 'assistant':
                header = "[ASSISTANT]\n"
                # Assistant content is an object: {text: "...", tool_calls: [...]}
                assistant_text = cell_content_data.get('text', '')
                tool_calls = cell_content_data.get('tool_calls', [])

                formatted_content = assistant_text

                if tool_calls:
                    # Append tool call section if it exists
                    tool_use_data = {"tool_use": tool_calls}
                    tool_use_header = "\n\n[tool_use]\n"
                    tool_use_json = f"```json\n{json.dumps(tool_use_data, indent=2)}\n```"
                    formatted_content += tool_use_header + tool_use_json

            elif cell_type == 'tool_output':
                header = f"[{cell_type.upper()}]\n"
                try:
                    # Assume content is a valid JSON string
                    parsed_json = json.loads(content)
                    formatted_content = f"```json\n{json.dumps(parsed_json, indent=2)}\n```"
                except (json.JSONDecodeError, TypeError):
                    # Fallback if content isn't valid JSON
                    formatted_content = content

            elif cell_type in ['thinking', 'thought']:
                header = f"**[{cell_type.upper()}]**\n\n"
                formatted_content = content
            else:
                header = f"[{cell_type.upper()}]\n"
                formatted_content = content

            source_content = (header + formatted_content).splitlines(True)

            notebook_cell = {
                "cell_type": "markdown",
                "metadata": {"colab_cell_type": cell_type},
                "source": source_content
            }
            notebook_content["cells"].append(notebook_cell)

    return json.dumps(notebook_content, indent=2)


# --- Admin Routes ---
@app.route('/api/users', methods=['GET'])
def get_users():
    if session.get('role') != 'owner':
        return jsonify({'message': 'Permission denied'}), 403
    users = User.query.all()
    users_data = [{'id': u.id, 'username': u.username, 'role': u.role} for u in users]
    return jsonify(users_data)


@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user_role(user_id):
    if session.get('role') != 'owner':
        return jsonify({'message': 'Permission denied'}), 403
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    data = request.get_json()
    user.role = data['role']
    db.session.commit()
    return jsonify({'message': 'User role updated successfully'})


@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def remove_user(user_id):
    if session.get('role') != 'owner':
        return jsonify({'message': 'Permission denied'}), 403

    if user_id == session.get('user_id'):
        return jsonify({'message': 'Cannot remove your own account'}), 400

    user_to_delete = db.session.get(User, user_id)
    if not user_to_delete:
        return jsonify({'message': 'User not found'}), 404

    Task.query.filter_by(claimed_by_id=user_id).update({
        'claimed_by_id': None,
        'status': 'unclaimed'
    })

    db.session.delete(user_to_delete)
    db.session.commit()
    return jsonify({'message': 'User removed successfully'})


# --- Authentication Routes ---
@app.route('/api/register', methods=['POST'])
def register():
    if session.get('role') != 'owner':
        return jsonify({'message': 'Permission denied'}), 403
    data = request.get_json()
    hashed_password = generate_password_hash(data['password'])
    new_user = User(username=data['username'], password_hash=hashed_password, role=data['role'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'New user created!'})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401

    session['user_id'] = user.id
    session['role'] = user.role
    return jsonify(
        {'message': 'Logged in successfully', 'user': {'id': user.id, 'username': user.username, 'role': user.role}})


@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('role', None)
    return jsonify({'message': 'Logged out successfully'})


@app.route('/api/current_user')
def current_user():
    if 'user_id' in session:
        user = db.session.get(User, session['user_id'])
        if user:
            return jsonify({'id': user.id, 'username': user.username, 'role': user.role})
    return jsonify({'error': 'Not logged in'}), 401


# --- Task Management Routes ---
@app.route('/api/tasks', methods=['POST'])
def create_task():
    if session.get('role') not in ['owner', 'reviewer']:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json()
    title = data.get('title', f'New Task - {uuid.uuid4()}')

    initial_colab_content = generate_colab_json(title, [])

    new_task = Task(
        title=title,
        created_by_id=session['user_id'],
        colab_content=initial_colab_content
    )
    db.session.add(new_task)
    db.session.commit()

    return jsonify({'message': 'Task created', 'task_id': new_task.id}), 201


@app.route('/api/tasks/queue/<queue_name>', methods=['GET'])
def get_task_queue(queue_name):
    if queue_name == 'unclaimed':
        tasks = Task.query.filter_by(status='unclaimed').all()
    elif queue_name == 'review':
        tasks = Task.query.filter_by(status='in_review').all()
    elif queue_name == 'approved':
        tasks = Task.query.filter_by(status='approved').all()
    elif queue_name == 'my_tasks':
        if session.get('role') != 'trainer':
            return jsonify({'message': 'Only trainers have "my tasks"'}), 403
        tasks = Task.query.filter_by(claimed_by_id=session['user_id']).filter(
            Task.status.in_(['claimed', 'rework'])).all()
    else:
        return jsonify({'message': 'Invalid queue name'}), 400

    tasks_data = [{'id': t.id, 'title': t.title, 'status': t.status} for t in tasks]
    return jsonify(tasks_data)


@app.route('/api/tasks/<task_id>/claim', methods=['POST'])
def claim_task(task_id):
    if session.get('role') != 'trainer':
        return jsonify({'message': 'Only trainers can claim tasks'}), 403

    task = db.session.get(Task, task_id)
    if not task or task.status != 'unclaimed':
        return jsonify({'message': 'Task not available for claiming'}), 404

    task.status = 'claimed'
    task.claimed_by_id = session['user_id']
    db.session.commit()
    return jsonify({'message': 'Task claimed successfully'})


@app.route('/api/tasks/<task_id>/submit', methods=['POST'])
def submit_task(task_id):
    task = db.session.get(Task, task_id)
    if task.claimed_by_id != session.get('user_id'):
        return jsonify({'message': 'Permission denied'}), 403

    task.status = 'in_review'
    db.session.commit()
    return jsonify({'message': 'Task submitted for review'})


@app.route('/api/tasks/<task_id>/action', methods=['POST'])
def task_action(task_id):
    if session.get('role') not in ['owner', 'reviewer']:
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json()
    action = data.get('action')

    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    if action == 'approve':
        task.status = 'approved'
        task.review_comments = None
    elif action == 'rework':
        task.status = 'rework'
        task.review_comments = data.get('comments', '')
    else:
        return jsonify({'message': 'Invalid action'}), 400

    db.session.commit()
    return jsonify({'message': f'Task status updated to {task.status}'})


# --- Task Content (Editor) Routes ---
@app.route('/api/tasks/<task_id>/content', methods=['GET'])
def get_task_content(task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    is_owner_reviewer = session.get('role') in ['owner', 'reviewer']
    is_assigned_trainer = task.claimed_by_id == session.get('user_id')

    if not (is_owner_reviewer or is_assigned_trainer):
        return jsonify({'message': 'Permission denied'}), 403

    cells = TaskCell.query.filter_by(task_id=task_id).order_by(TaskCell.cell_order).all()
    cells_data = [{'id': c.id, 'cell_type': c.cell_type, 'content': c.content, 'order': c.cell_order} for c in cells]

    return jsonify({
        'task_id': task.id,
        'title': task.title,
        'status': task.status,
        'review_comments': task.review_comments,
        'cells': cells_data
    })


@app.route('/api/tasks/<task_id>/content', methods=['POST'])
def save_task_content(task_id):
    task = db.session.get(Task, task_id)
    if task.claimed_by_id != session.get('user_id'):
        return jsonify({'message': 'Permission denied'}), 403

    data = request.get_json()
    cells_data = data.get('cells', [])

    TaskCell.query.filter_by(task_id=task_id).delete()

    for i, cell_data in enumerate(cells_data):
        new_cell = TaskCell(
            task_id=task_id,
            cell_order=i,
            cell_type=cell_data['cell_type'],
            content=cell_data['content']
        )
        db.session.add(new_cell)

    task.colab_content = generate_colab_json(task.title, cells_data)
    db.session.commit()

    return jsonify({'message': 'Content saved successfully'})


# --- Download Routes ---
@app.route('/api/tasks/<task_id>/download', methods=['GET'])
def download_colab_file(task_id):
    task = db.session.get(Task, task_id)
    if not task:
        return jsonify({'message': 'Task not found'}), 404

    is_owner_reviewer = session.get('role') in ['owner', 'reviewer']
    is_assigned_trainer = task.claimed_by_id == session.get('user_id')
    if not (is_owner_reviewer or is_assigned_trainer):
        return jsonify({'message': 'Permission denied'}), 403

    if not task.colab_content:
        return jsonify({'message': 'No Colab content found for this task'}), 404

    return Response(
        task.colab_content,
        mimetype='application/vnd.google.colaboratory',
        headers={'Content-disposition': f'attachment; filename={task.title}.ipynb'}
    )


@app.route('/api/tasks/download/batch', methods=['POST'])
def download_batch():
    if session.get('role') not in ['owner', 'reviewer']:
        return jsonify({'message': 'Permission denied'}), 403

    approved_tasks = Task.query.filter_by(status='approved').all()
    if not approved_tasks:
        return jsonify({'message': 'No approved tasks to download'}), 404

    memory_file = io.BytesIO()
    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
        for task in approved_tasks:
            filename = "".join(c for c in task.title if c.isalnum() or c in (' ', '.', '_')).rstrip()
            zf.writestr(f"{filename}.ipynb", task.colab_content)

    for task in approved_tasks:
        db.session.delete(task)
    db.session.commit()

    memory_file.seek(0)
    return Response(
        memory_file,
        mimetype='application/zip',
        headers={'Content-disposition': 'attachment; filename=approved_tasks.zip'}
    )


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(role='owner').first():
            print("No owner account found. Creating a default owner.")
            hashed_password = generate_password_hash('password')
            new_owner = User(username='admin', password_hash=hashed_password, role='owner')
            db.session.add(new_owner)
            db.session.commit()
            print("Default owner 'admin' with password 'password' created.")
    app.run(debug=True, port=5004)
