let shapes = {
    // Multi weapon
    MultiWeapon: (x, y, drawScale, angle, topPercent = 0) => {
        if (!x || !y || !drawScale || !angle)
            return;
        push();
        translate(x, y);
        rotate(angle);
        scale(drawScale);
        // Barrels
        beginShape();
        fill("#6c6c6c");
        vertex(0, -5);
        vertex(30, -5);
        vertex(30, 5);
        vertex(0, 5);
        endShape(CLOSE);
        beginShape();
        // Top
        beginShape();
        fill("#afafaf");
        vertex(22, -3);
        vertex(30, -3);
        vertex(30, 3);
        vertex(22, 3);
        endShape(CLOSE);
        beginShape();
        vertex(0 - topPercent * 10, -3);
        vertex(20 - topPercent * 10, -3);
        vertex(20 - topPercent * 10, 3);
        vertex(0 - topPercent * 10, 3);
        endShape(CLOSE);
        // Front
        beginShape();
        fill("#5e5e5e");
        vertex(29, -6);
        vertex(31, -6);
        vertex(31, 6);
        vertex(29, 6);
        endShape(CLOSE);
        beginShape();
        pop();
    },
    // Debug square shape
    square: (x, y, sx, sy) => {
        if (!x || !y || !sx || !sy)
            return;
        beginShape();
        vertex(x - sx / 2, y - sy / 2);
        vertex(x + sx / 2, y - sy / 2);
        vertex(x + sx / 2, y + sy / 2);
        vertex(x - sx / 2, y + sy / 2);
        endShape(CLOSE);
    }
};
