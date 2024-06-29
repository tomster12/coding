float timer = 0.0f;
float timerMax = 2.0f;

void setup() {
    size(400, 400);
}

void draw() {
    if (timer > 0) {
        background(255, 0, 0);
        timer -= 1.0f / frameRate;
    } else {
        background(0, 255, 0);
    }
}

void mousePressed() {
    timer = timerMax;
}