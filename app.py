from flask import Flask, render_template, request, Response, jsonify
import opencv-python
import cv2
import numpy as np
import os

PHOTO_FOLDER = 'static/photos'

app = Flask(__name__)
current_color = 'red'
is_capturing = False  # Track capturing state
wag_count = 0  # Store wag count

# Color detection ranges
color_ranges = {
    'red': [
        (np.array([0, 100, 100]), np.array([10, 255, 255])),  # Bright red
        (np.array([170, 100, 100]), np.array([180, 255, 255])),  # Mid-tone red
    ],
    'green': [
        (np.array([35, 50, 40]), np.array([85, 255, 255])),  # Bright green
        (np.array([30, 50, 60]), np.array([90, 255, 200])),  # Mid-tone green
    ],
    'blue': [
        (np.array([100, 150, 255]), np.array([140, 255, 255])),  # Bright blue
        (np.array([100, 150, 150]), np.array([140, 255, 255])),  # Mid-tone blue
        (np.array([100, 150, 50]), np.array([140, 255, 150]))    # Dark blue
    ]
}
if not os.path.exists(PHOTO_FOLDER):
    os.makedirs(PHOTO_FOLDER)


@app.route('/')
def index():
    return render_template('wag_home.html')

@app.route('/main')
def main():
    return render_template('wag_main.html')

@app.route('/score')
def score():
    return render_template('wag_record.html')

@app.route('/selfie')
def selfie():
    return render_template('wag_selfie.html')

@app.route('/set_color', methods=['POST'])
def set_color():
    global current_color
    current_color = request.form['color']
    return 'Color set'

@app.route('/start_capture')
def start_capture():
    global is_capturing, wag_count
    is_capturing = True
    wag_count = 0  # Reset wag count at start
    return 'Capture started'

@app.route('/stop_capture')
def stop_capture():
    global is_capturing
    is_capturing = False
    return 'Capture stopped'

@app.route('/get_wag_count')
def get_wag_count():
    return jsonify(wag_count=wag_count)

@app.route('/selfie_time')
def index2():
    return render_template('index2.html')

@app.route('/capture_photo', methods=['POST'])
# def capture_photo():
#     cap = cv2.VideoCapture(0)  # Start the webcam
#     success, img = cap.read()  # Capture a frame
#     cap.release()
#
#     if success:
#         # Save the captured photo to a file
#         photo_path = os.path.join(PHOTO_FOLDER, 'captured_photo.jpg')
#         cv2.imwrite(photo_path, img)
#         return jsonify(message="Photo captured successfully", photo_path=f"/{photo_path}")
#     else:
#         return jsonify(message="Error capturing photo", photo_path="")

@app.route('/capture_photo', methods=['POST'])
def capture_photo():
    cap = cv2.VideoCapture(0)  # Start the webcam
    success, img = cap.read()  # Capture a frame
    cap.release()

    if success:
        # Determine the next available image index
        existing_files = os.listdir(PHOTO_FOLDER)
        image_numbers = [
            int(file.split('.')[0]) for file in existing_files if file.split('.')[0].isdigit()
        ]
        next_index = max(image_numbers) + 1 if image_numbers else 1

        # Save the captured photo with the next index
        photo_path = os.path.join(PHOTO_FOLDER, f"{next_index}.jpg")
        cv2.imwrite(photo_path, img)

        return jsonify(message="Photo captured successfully", photo_path=f"/{photo_path}")
    else:
        return jsonify(message="Error capturing photo", photo_path="")

def generate_video_stream():
    global wag_count
    cap = cv2.VideoCapture(0)
    tail_position_list = []
    counter = 0

    while True:
        if not is_capturing:
            continue  # Skip frames when not capturing

        success, img = cap.read()
        if not success:
            break

        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

        # Create a mask using the selected color range
        masks = [cv2.inRange(hsv, *range) for range in color_ranges[current_color]]
        mask = sum(masks)

        # Find contours of the detected color
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if contours:
            # Get the largest red contour and draw a green bounding box around it
            max_contour = max(contours, key=cv2.contourArea)
            x, y, w, h = cv2.boundingRect(max_contour)

            # Draw green box over the detected red object
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)

            # Wag detection logic
            tail_position = x + w // 2
            tail_position_list.append(tail_position)
            if len(tail_position_list) > 3:
                tail_position_list.pop(0)

            if len(tail_position_list) >= 3 and abs(
                    tail_position_list[0] - tail_position_list[2]) > 25 and counter == 0:
                wag_count += 1
                counter = 1

            if counter != 0:
                counter += 1
                if counter > 10:
                    counter = 0

        # Encode frame for streaming
        _, buffer = cv2.imencode('.jpg', img)
        frame = buffer.tobytes()
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    cap.release()


def generate_video_stream2():
    cap = cv2.VideoCapture(0)  # Start the webcam (0 for default camera)
    while True:
        success, img = cap.read()  # Capture frame by frame
        if not success:
            break
        _, buffer = cv2.imencode('.jpg', img)  # Convert frame to JPEG
        frame = buffer.tobytes()  # Convert to bytes for transmission
        yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')  # MJPEG frame


@app.route('/video_feed')
def video_feed():
    return Response(generate_video_stream(), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/video_feed2')
def video_feed2():
    return Response(generate_video_stream2(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    app.run(debug=True)
