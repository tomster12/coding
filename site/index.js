const projects = {
    "Wave Function Collapse": { url: "https://github.com/tomster12/coding/tree/master/c/raylib_overlapping_wfc", showcase: "assets/gifs/WFC.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c", "raylib"] },
    "Entity Component System (ECS)": { url: "https://github.com/tomster12/coding/tree/master/c++/ECS", showcase: "assets/gifs/ECS.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Liquid Simulation": { url: "https://github.com/tomster12/coding/tree/master/c++/Liquid", showcase: "assets/gifs/Liquid.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Machine Learning (from scratch)": { url: "https://github.com/tomster12/machine-learning-cpp", showcase: "assets/gifs/MachineLearning.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Collision 1D": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/collision_1D", showcase: "assets/gifs/1DCollision.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Boids": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/boids_2D", showcase: "assets/gifs/Boids1.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Cave Generation": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/cave_generation", showcase: "assets/gifs/CaveGeneration1.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Dungeon Generation": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/dungeon_generation", showcase: "assets/gifs/DungeonGeneration1.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Fourier": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/fourier", showcase: "assets/gifs/Fourier.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Gate Simulation": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/gates_attempt_3", showcase: "assets/gifs/Gates1.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Pathfinding Visualization": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/pathfinding_visualization", showcase: "assets/gifs/Pathfinding.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Slide": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/slide", showcase: "assets/gifs/Slide.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Boids": { url: "https://github.com/tomster12/coding/tree/master/processing/Boids", showcase: "assets/gifs/Boids2.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Camera": { url: "https://github.com/tomster12/coding/tree/master/processing/Camera", showcase: "assets/gifs/Camera.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Camera 3D": { url: "https://github.com/tomster12/coding/tree/master/processing/Camera3D", showcase: "assets/gifs/Camera3D.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Cave Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/CaveGeneration", showcase: "assets/gifs/CaveGeneration2.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Dungeon Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/DungeonGeneration", showcase: "assets/gifs/DungeonGeneration2.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Roguelike Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/RoguelikeGeneration", showcase: "assets/gifs/RoguelikeGeneration.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Chaos Equations": { url: "https://github.com/tomster12/coding/tree/master/processing/ChaosEquations", showcase: "assets/gifs/ChaosEquations.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Cut Mesh": { url: "https://github.com/tomster12/coding/tree/master/processing/CutMesh", showcase: "assets/gifs/CutMesh.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Fluid Sim Main": { url: "https://github.com/tomster12/coding/tree/master/processing/FluidSimMain", showcase: "assets/gifs/FluidSimulation.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Game Of Life": { url: "https://github.com/tomster12/coding/tree/master/processing/GameOfLife", showcase: "assets/gifs/GameOfLife.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Gate Simulation": { url: "https://github.com/tomster12/coding/tree/master/processing/GatesAttempt2", showcase: "assets/gifs/Gates2.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Gravity Simulation": { url: "https://github.com/tomster12/coding/tree/master/processing/Gravity", showcase: "assets/gifs/Gravity.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Lissajous Curves": { url: "https://github.com/tomster12/coding/tree/master/processing/LissajousCurves", showcase: "assets/gifs/LissajousCurves.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Mandelbrot": { url: "https://github.com/tomster12/coding/tree/master/processing/Mandelbrot", showcase: "assets/gifs/Mandelbrot.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Marching Squares": { url: "https://github.com/tomster12/coding/tree/master/processing/MarchingSquares", showcase: "assets/gifs/MarchingSquares.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Maze Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/MazeGeneration", showcase: "assets/gifs/MazeGeneration.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Sorting": { url: "https://github.com/tomster12/coding/tree/master/processing/Sorting", showcase: "assets/gifs/SortingAlgorithms.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Particle Clock": { url: "https://github.com/tomster12/coding/tree/master/processing/ParticleClock", showcase: "assets/gifs/ParticleClock.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 2D": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching2D", showcase: "assets/gifs/RayMarching.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 3D": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching3D", showcase: "assets/gifs/RayMarching3D.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 2D Shadows": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching2DShadows", showcase: "assets/gifs/RayMarchingShadows.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "RB Collision 2D": { url: "https://github.com/tomster12/coding/tree/master/processing/RBCollision2D", showcase: "assets/gifs/RigidbodyCollision.gif", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] }
};

const tagColours = {
    "c": "#b9d3f1",
    "c++": "#d9b7f2",
    "raylib": "#f1e4b9",
    "sfml": "#f4acac",
    "js": "#fff79e",
    "p5js": "#cfffaf",
    "processing": "#b9f1d3",
    "game": "#f1b9b9",
    "simulation": "#b9f1f1",
    "repo": "#d9d7d9"
};

const projectContainer = document.querySelector(".project-container");

function createHTMLElement(elementString) {
    const div = document.createElement("div");
    div.innerHTML = elementString;
    return div.firstElementChild;
}

function clickProject(e, projectName) {
    e.stopPropagation();
    window.location = projects[projectName].url;
}

function clickProjectRepo(e, projectName) {
    e.stopPropagation();
    window.location = projects[projectName].repo[1];
}

function clickTag(e, tag) {
    e.stopPropagation();
}

Object.keys(projects).forEach(projectName => {
    const project = projects[projectName];

    const projectElement = createHTMLElement(`
        <div class="project" onclick="clickProject(event, '${projectName}')">
            <div class="title-section">
                <p class="title">${projectName}</p>
            </div>
            <div class="showcase-section">
                <img src="${project.showcase}" alt="" />
            </div>
            <div class="footer-section">
                <div class="footer-row">
                    <p class="label">repo</p>
                    <span class="tag" style="background-color:${tagColours["repo"]};" onclick="clickProjectRepo(event, '${projectName}')">${project.repo[0]}</span>
                </div>
                <div class="footer-row">
                    <p class="label">tags</p>
                    <div class="tags-list">
                        ${project.tags.map(tag => `<span class="tag" style="background-color:${tagColours[tag]};" onclick="clickTag(event, '${tag}')">${tag}</span>`).join("")}
                    </div>
                </div>
            </div>
        </div>
    `);
    projectContainer.appendChild(projectElement);
});
