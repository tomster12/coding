

# Setup variables
import cv2 as cv
cv.namedWindow("window")
vc = cv.VideoCapture(0)
ret = vc.isOpened()

# Pretrained classifier for faces / eyes
face_cascade = cv.CascadeClassifier('haarcascade_frontalface_default.xml')
eye_cascade = cv.CascadeClassifier('haarcascade_eye.xml')

# Show cam every 20ms
while ret:
    (ret, img) = vc.read()
    gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)

    # Detect faces and draw rect around
    faces = face_cascade.detectMultiScale(gray, 1.3, 4)
    for (x, y, w, h) in faces:
        cv.rectangle(
            img,
            (x,y),
            (x+w,y+h),
            (255,0,0), 2
        )

        # Limit area to face and detect eyes then draw rect around
        roi_gray = gray[y:y+h, x:x+w]
        roi_color = img[y:y+h, x:x+w]
        eyes = eye_cascade.detectMultiScale(roi_gray)
        for (ex, ey, ew, eh) in eyes:
            cv.rectangle(
                roi_color,
                (ex,ey),
                (ex+ew,ey+eh),
                (0,255,0), 2
            )

    # Show image then close if needed
    cv.imshow("window", img)
    key = cv.waitKey(20)
    if key == 27:
        break

# Close down everything
vc.release()
cv.destroyWindow("preview")
