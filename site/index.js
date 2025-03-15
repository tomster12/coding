const projects = {
    "Heightmap": { url: "https://github.com/tomster12/coding/tree/master/c/raylib_heightmap", showcase: "Heightmap", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c", "raylib"] },
    "Wave Function Collapse": { url: "https://github.com/tomster12/coding/tree/master/c/raylib_overlapping_wfc", showcase: "WFC", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c", "raylib"] },
    "Entity Component System": { url: "https://github.com/tomster12/coding/tree/master/c++/ECS", showcase: "ECS", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Liquid Simulation": { url: "https://github.com/tomster12/coding/tree/master/c++/Liquid", showcase: "Liquid", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Machine Learning<br/>(from scratch)": { url: "https://github.com/tomster12/machine-learning-cpp", showcase: "MachineLearning", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["c++", "sfml"] },
    "Collision 1D": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/collision_1D", showcase: "1DCollision", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Boids": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/boids_2D", showcase: "Boids1", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Cave Generation 1": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/cave_generation", showcase: "CaveGeneration1", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Dungeon Generation 1": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/dungeon_generation", showcase: "DungeonGeneration1", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Fourier": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/fourier", showcase: "Fourier", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Gate Simulation 1": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/gates_attempt_3", showcase: "Gates1", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Pathfinding Visualization": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/pathfinding_visualisation", showcase: "Pathfinding", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Slide": { url: "https://github.com/tomster12/coding/tree/master/web/p5js/slide", showcase: "Slide", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["js", "p5js"] },
    "Boids": { url: "https://github.com/tomster12/coding/tree/master/processing/Boids", showcase: "Boids2", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Camera": { url: "https://github.com/tomster12/coding/tree/master/processing/Camera", showcase: "Camera", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Camera 3D": { url: "https://github.com/tomster12/coding/tree/master/processing/Camera3D", showcase: "Camera3D", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Cave Generation 2": { url: "https://github.com/tomster12/coding/tree/master/processing/ProceduralGeneration/CaveGeneration", showcase: "CaveGeneration2", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Dungeon Generation 2": { url: "https://github.com/tomster12/coding/tree/master/processing/ProceduralGeneration/DungeonGeneration", showcase: "DungeonGeneration2", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Roguelike Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/ProceduralGeneration/RoguelikeGeneration", showcase: "RoguelikeGeneration", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Chaos Equations": { url: "https://github.com/tomster12/coding/tree/master/processing/ChaosEquations", showcase: "ChaosEquations", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Cut Mesh": { url: "https://github.com/tomster12/coding/tree/master/processing/CutMesh", showcase: "CutMesh", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Fluid Sim": { url: "https://github.com/tomster12/coding/tree/master/processing/FluidSim/FluidSimMain", showcase: "FluidSimulation", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Game Of Life": { url: "https://github.com/tomster12/coding/tree/master/processing/GameOfLife", showcase: "GameOfLife", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Gate Simulation 2": { url: "https://github.com/tomster12/coding/tree/master/processing/Gates", showcase: "Gates2", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Gravity Simulation": { url: "https://github.com/tomster12/coding/tree/master/processing/Gravity", showcase: "Gravity", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Lissajous Curves": { url: "https://github.com/tomster12/coding/tree/master/processing/LissajousCurves", showcase: "LissajousCurves", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Mandelbrot": { url: "https://github.com/tomster12/coding/tree/master/processing/Mandelbrot", showcase: "Mandelbrot", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Marching Squares": { url: "https://github.com/tomster12/coding/tree/master/processing/MarchingSquares", showcase: "MarchingSquares", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Maze Generation": { url: "https://github.com/tomster12/coding/tree/master/processing/MazeGeneration", showcase: "MazeGeneration", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Sorting": { url: "https://github.com/tomster12/coding/tree/master/processing/Sorting", showcase: "SortingAlgorithms", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Particle Clock": { url: "https://github.com/tomster12/coding/tree/master/processing/ParticleClock", showcase: "ParticleClock", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 2D": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching2D", showcase: "RayMarching", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 3D": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching3D", showcase: "RayMarching3D", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "Ray Marching 2D Shadows": { url: "https://github.com/tomster12/coding/tree/master/processing/RayMarching2DShadows", showcase: "RayMarchingShadows", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] },
    "RB Collision 2D": { url: "https://github.com/tomster12/coding/tree/master/processing/Collision/RBCollision2D", showcase: "RigidbodyCollision", repo: ["Coding", "https://github.com/tomster12/coding"], tags: ["processing"] }
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
                <img src="assets/previews/${project.showcase}.jpg" />
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

    // Listen to mouseenter / leave the .project and update the preview image src
    const showcaseSection = projectElement.querySelector(".showcase-section");
    projectElement.addEventListener("mouseenter", () => {
        showcaseSection.querySelector("img").src = `assets/gifs/${project.showcase}.gif`;
    });
    projectElement.addEventListener("mouseleave", () => {
        showcaseSection.querySelector("img").src = `assets/previews/${project.showcase}.jpg`;
    });

    projectContainer.appendChild(projectElement);
});
