import os
from dotenv import load_dotenv

# Load environment variables before importing anything that uses them
load_dotenv()
print(f"DATABASE_URL from env: {os.getenv('DATABASE_URL')}")
print(f"JWT_SECRET_KEY from env: {os.getenv('JWT_SECRET_KEY')}")

from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, create_access_token
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from config import Config  # Import Config after load_dotenv()
from models import db, User, Image

app = Flask(__name__)

# Debug the Config object before applying it
print(f"Config.SQLALCHEMY_DATABASE_URI: {Config.SQLALCHEMY_DATABASE_URI}")
print(f"Config.JWT_SECRET_KEY: {Config.JWT_SECRET_KEY}")

app.config.from_object(Config)
print(f"SQLALCHEMY_DATABASE_URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
print(f"JWT_SECRET_KEY: {app.config['JWT_SECRET_KEY']}")
db.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print('Received registration request:', data)
    email, password = data['email'], data['password']
    if User.query.filter_by(email=email).first():
        print(f"User with email {email} already exists")
        return jsonify({"msg": "User already exists"}), 400
    hashed_pw = generate_password_hash(password, method='pbkdf2:sha256:1000000')
    print(f"Hashed password length: {len(hashed_pw)}")
    new_user = User(email=email, password=hashed_pw)
    db.session.add(new_user)
    try:
        db.session.commit()
        print(f"User {email} created successfully")
    except Exception as e:
        db.session.rollback()
        print(f"Detailed database error: {str(e)}")
        return jsonify({"msg": "Database error", "error": str(e)}), 500
    return jsonify({"msg": "User created"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print('Received login request:', data)
    email, password = data['email'], data['password']
    user = User.query.filter_by(email=email).first()
    if not user:
        print(f"No user found with email: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401
    print(f"Stored hash: {user.password}")
    if not check_password_hash(user.password, password):
        print(f"Password verification failed for user: {email}")
        return jsonify({"msg": "Invalid credentials"}), 401
    access_token = create_access_token(identity=str(user.id))
    print(f"Login successful for user: {email}")
    return jsonify({"token": access_token})

@app.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    try:
        user_id = int(get_jwt_identity())
        print(f"Uploading image for user_id: {user_id}")
        if 'image' not in request.files:
            return jsonify({"msg": "No image part"}), 400
        file = request.files['image']
        if file.filename == '':
            return jsonify({"msg": "No selected file"}), 400
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        print(f"Saving file to: {file_path}")
        file.save(file_path)
        new_image = Image(user_id=user_id, filename=filename, s3_url='')  # Provide a value for s3_url
        db.session.add(new_image)
        db.session.commit()
        return jsonify({"msg": "Image uploaded", "filename": filename})
    except Exception as e:
        print(f"Error in /upload endpoint: {str(e)}")
        return jsonify({"msg": "Server error", "error": str(e)}), 500

@app.route('/images', methods=['GET'])
@jwt_required()
def get_images():
    try:
        user_id = int(get_jwt_identity())
        print(f"Fetching images for user_id: {user_id}")
        images = Image.query.filter_by(user_id=user_id).all()
        return jsonify([{"id": img.id, "filename": img.filename} for img in images])
    except Exception as e:
        print(f"Error in /images endpoint: {str(e)}")
        return jsonify({"msg": "Error fetching images", "error": str(e)}), 500

@app.route('/images/<filename>')
def get_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)