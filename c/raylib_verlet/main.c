// cbuild: -I../libs/raylib/include -L../libs/raylib/lib
// cbuild: -lraylib -lopengl32 -lgdi32 -lwinmm

#include <math.h>
#include "raylib.h"

#define MAX_POINTS 1000
#define MAX_CONSTRAINTS 1000
#define POINT_SIZE 25
#define EDGE_SIZE 10
#define GRAVITY_ACC 0.3
#define DAMPING 1.0
#define RESTITUTION 1.0

typedef struct Point
{
    Vector2 x;
    Vector2 x_prv;
    Vector2 x_nxt;
    Vector2 acc;
} Point;

typedef struct Constraint
{
    int a;
    int b;
    float distance;
} Constraint;

typedef struct World
{
    Point points[MAX_POINTS];
    Constraint constraints[MAX_CONSTRAINTS];
    int num_points;
    int num_constraints;
} World;

float clamp_range(float value, float min, float max)
{
    if (value < min)
    {
        return min;
    }
    else if (value > max)
    {
        return max;
    }
    return value;
}

int world_add_point(World *world, float px, float py, float vx, float vy)
{
    if (world->num_points >= MAX_POINTS)
    {
        return -1;
    }

    Point point = {0};
    point.x = (Vector2){px, py};
    point.x_prv = (Vector2){px - vx, py - vy};
    point.x_nxt = (Vector2){px, py};
    point.acc = (Vector2){0, GRAVITY_ACC};

    world->points[world->num_points++] = point;
    return world->num_points - 1;
}

int world_add_constraint(World *world, int a, int b, float distance)
{
    if (world->num_constraints >= MAX_CONSTRAINTS)
    {
        return -1;
    }

    Constraint constraint = {0};
    constraint.a = a;
    constraint.b = b;
    constraint.distance = distance;

    world->constraints[world->num_constraints++] = constraint;
}

int world_add_random_point(World *world)
{
    float px = GetRandomValue(POINT_SIZE, GetScreenWidth() - POINT_SIZE);
    float py = GetRandomValue(POINT_SIZE, GetScreenHeight() - POINT_SIZE);
    float vx = GetRandomValue(-5, 5);
    float vy = GetRandomValue(-5, 5);
    return world_add_point(world, px, py, vx, vy);
}

void world_add_random_pair(World *world)
{
    // Pick a random midpoint, angle, and length
    float angle = GetRandomValue(0, 360);
    float length = GetRandomValue(50, 200);
    float midx = GetRandomValue(POINT_SIZE + length * 0.5, GetScreenWidth() - POINT_SIZE - length * 0.5);
    float midy = GetRandomValue(POINT_SIZE + length * 0.5, GetScreenHeight() - POINT_SIZE - length * 0.5);

    // Calculate the end points
    float px1 = midx + cosf(angle) * length * 0.5;
    float py1 = midy + sinf(angle) * length * 0.5;
    float px2 = midx - cosf(angle) * length * 0.5;
    float py2 = midy - sinf(angle) * length * 0.5;
    float vx1 = GetRandomValue(-5, 5);
    float vy1 = GetRandomValue(-5, 5);
    float vx2 = GetRandomValue(-5, 5);
    float vy2 = GetRandomValue(-5, 5);

    // Add the points and constraints
    int a = world_add_point(world, px1, py1, vx1, vy1);
    int b = world_add_point(world, px2, py2, vx2, vy2);
    world_add_constraint(world, a, b, length);
}

void world_update(World *world)
{
    for (int i = 0; i < world->num_points; i++)
    {
        Point *p = &world->points[i];

        // Verlet integration to update position
        // x_t+1 = x_t + (x_t - x_t-1) * damping + a_t
        p->x_nxt.x = p->x.x + (p->x.x - p->x_prv.x) * DAMPING + p->acc.x;
        p->x_nxt.y = p->x.y + (p->x.y - p->x_prv.y) * DAMPING + p->acc.y;
    }

    for (int i = 0; i < world->num_constraints; i++)
    {
        Point *a = &world->points[world->constraints[i].a];
        Point *b = &world->points[world->constraints[i].b];

        // Distance constraints on points
        // Ensure a.x_t+1 and b.x_t+1 are 'distance' apart
        float dx = b->x_nxt.x - a->x_nxt.x;
        float dy = b->x_nxt.y - a->x_nxt.y;
        float d = sqrtf(dx * dx + dy * dy);
        float diff = (world->constraints[i].distance - d) / d;
        a->x_nxt.x -= dx * 0.5 * diff;
        a->x_nxt.y -= dy * 0.5 * diff;
        b->x_nxt.x += dx * 0.5 * diff;
        b->x_nxt.y += dy * 0.5 * diff;
    }

    for (int i = 0; i < world->num_points; i++)
    {
        Point *p = &world->points[i];

        // Clamp positions to screen and update previous position
        // Clamp x_t+1 to screen and override x_t and x_t-1 to (x_t+1 + v_t * restitution)
        if (p->x_nxt.x < POINT_SIZE || p->x_nxt.x > GetScreenWidth() - POINT_SIZE)
        {
            float v_x = p->x.x - p->x_prv.x;
            p->x_nxt.x = clamp_range(p->x_nxt.x, POINT_SIZE, GetScreenWidth() - POINT_SIZE);
            p->x.x = p->x_nxt.x + v_x * RESTITUTION;
        }
        if (p->x_nxt.y < POINT_SIZE || p->x_nxt.y > GetScreenHeight() - POINT_SIZE)
        {
            float v_y = p->x.y - p->x_prv.y;
            p->x_nxt.y = clamp_range(p->x_nxt.y, POINT_SIZE, GetScreenHeight() - POINT_SIZE);
            p->x.y = p->x_nxt.y + v_y * RESTITUTION;
        }

        // Update positions
        // p_t-1 = p_t and p_t = p_t+1
        p->x_prv.x = p->x.x;
        p->x_prv.y = p->x.y;
        p->x.x = p->x_nxt.x;
        p->x.y = p->x_nxt.y;
    }
}

void world_draw(World *world)
{
    for (int i = 0; i < world->num_constraints; i++)
    {
        Point a = world->points[world->constraints[i].a];
        Point b = world->points[world->constraints[i].b];
        DrawLineEx(a.x, b.x, EDGE_SIZE, (Color){255, 255, 255, 255});
    }

    for (int i = 0; i < world->num_points; i++)
    {
        Point *p = &world->points[i];
        DrawCircleV(p->x, POINT_SIZE, (Color){255, 255, 255, 255});
        DrawCircleV(p->x, POINT_SIZE - EDGE_SIZE, (Color){44, 41, 53, 255});
    }
}

int main()
{
    InitWindow(1000, 1000, "GCC Build");
    SetTargetFPS(60);

    World world = {0};

    world_add_point(&world, 450, 500, 5, 0);
    world_add_point(&world, 600, 600, 0, 5);
    world_add_constraint(&world, 0, 1, 150);

    while (!WindowShouldClose())
    {
        world_update(&world);

        if (IsKeyPressed(KEY_SPACE))
        {
            world_add_random_pair(&world);
        }

        BeginDrawing();
        ClearBackground((Color){44, 41, 53, 255});
        world_draw(&world);
        EndDrawing();
    }

    CloseWindow();

    return 0;
}
