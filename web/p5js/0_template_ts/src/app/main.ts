import p5 from "p5";

export default (p: p5) => {
    p.setup = () => {
        const canvas = p.createCanvas(400, 400);
        canvas.parent("app");
    };

    p.draw = () => {
        p.background(220);
        p.ellipse(p.width / 2, p.height / 2, 50, 50);
    };
};
