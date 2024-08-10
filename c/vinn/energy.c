
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define DEBUG0 0
#define DEBUG1 0
#define MAX_CITIES 100
#define MAX_NAME_LENGTH 30




#pragma region -- Graph Datastructure --

struct Graph {
  int nodeCount;
  struct Node* nodes;
};

struct Node {
    struct NodeEdgeAdj* edgeHead;
};

struct NodeEdgeAdj {
    int target;
    int cost;
    struct NodeEdgeAdj* next;
};


struct NodeEdgeAdj* createEdge(int target, int cost) {
    // Create node and initialize variables
    struct NodeEdgeAdj* newNode = malloc(sizeof(struct NodeEdgeAdj));
    newNode->target = target;
    newNode->cost = cost;
    newNode->next = NULL;
    return newNode;
}


struct Graph* createGraph(int nodeCount) {
    // Initialize graph
    struct Graph* graph = malloc(sizeof(struct Graph));
    graph->nodeCount = nodeCount;

    // Create adjacency list
    graph->nodes = malloc(nodeCount * sizeof(struct Node));
    for (int i = 0; i < nodeCount; i++) graph->nodes[i].edgeHead = NULL;
    return graph;
}


void _addEdge(struct Graph* graph, int srcIndex, int targetIndex, int cost) {
    // Initialize adjacency list
    struct NodeEdgeAdj* newEdge = createEdge(targetIndex, cost);
    if (graph->nodes[srcIndex].edgeHead == NULL) {
        newEdge->next = graph->nodes[srcIndex].edgeHead;
        graph->nodes[srcIndex].edgeHead = newEdge;

    // Add to end of adjacency list
    } else {
        struct NodeEdgeAdj* end = graph->nodes[srcIndex].edgeHead;
        while (end->next != NULL) end = end->next;
        end->next = newEdge;
    }

    // Add alternate edge
}

void addEdge(struct Graph* graph, int srcIndex, int targetIndex, int cost) {
    _addEdge(graph, srcIndex, targetIndex, cost);
    _addEdge(graph, targetIndex, srcIndex, cost);
}


void printGraph(struct Graph* graph) {
    // Loop over and print graph nodes
    for (int i = 0; i < graph->nodeCount; i++) {
        struct NodeEdgeAdj* edge = graph->nodes[i].edgeHead;
        printf("List for node %d:\nhead", i);

        while (edge) {
            printf(" -> %d", edge->target);
            edge = edge->next;
        }
        printf("\n\n");
    }
    printf("\n");
}

#pragma endregion


#pragma region -- FIFO Queue --

struct Queue {
    size_t head;
    size_t tail;
    size_t size;
    size_t count;
    void** data;
};


void* queueRead(struct Queue* queue) {
    if (queue->tail == queue->head) return NULL;

    // Read tail, then increment
    void* value = queue->data[queue->tail];
    queue->data[queue->tail] = NULL;
    queue->tail = (queue->tail + 1) % queue->size;
    queue->count--;
    return value;
}


int queueWrite(struct Queue* queue, void* value) {
    if (((queue->head + 1) % queue->size) == queue->tail) return -1;

    // Write value to head, then increment
    queue->data[queue->head] = value;
    queue->head = (queue->head + 1) % queue->size;
    queue->count++;
    return 0;
}


int queueContains(struct Queue* queue, void* value) {
    // Loop through queue and check each value
    size_t current = queue->tail;
    while (current != queue->head) {
        if (queue->data[current] = value) return 1;
        current = (current + 1) % queue->size;
    }
    return 0;
}

#pragma endregion


int cityCount;
char cityOrder[MAX_CITIES][MAX_NAME_LENGTH];
struct Graph* parseGraph(char* filename) {
    // Read files
    FILE* fp = fopen(filename, "r");
    if (!fp) return NULL;

    // Initialize variables
    struct Graph* graph = createGraph(MAX_CITIES);
    char c, cityA[MAX_NAME_LENGTH], cityB[MAX_NAME_LENGTH], costS[MAX_NAME_LENGTH];

    // Loop over file (checking for eof)
    while ((c = fgetc(fp)) != EOF) {
        ungetc(c, fp);

        // Read city association
        fscanf(fp, "%s", cityA);
        fscanf(fp, "%s", cityB);
        fscanf(fp, "%s", costS);
        int cost = atoi(costS);
        if (DEBUG0) printf("%s -> %s : %d\n", cityA, cityB, cost);

        // Get city indices for cityA and cityB
        int cityAIndex, cityBIndex;
        for (cityAIndex = 0; cityAIndex < cityCount && strcmp(cityA, cityOrder[cityAIndex]) != 0; cityAIndex++) { }
        if (cityAIndex == cityCount) {
            if (DEBUG0) printf("New city %s = %d\n", cityA, cityAIndex);
            strcpy(cityOrder[cityAIndex], cityA);
            cityCount++;
        }
        for (cityBIndex = 0; cityBIndex < cityCount && strcmp(cityB, cityOrder[cityBIndex]) != 0; cityBIndex++) { }
        if (cityBIndex == cityCount) {
            if (DEBUG0) printf("New city %s = %d\n", cityB, cityBIndex);
            strcpy(cityOrder[cityBIndex], cityB);
            cityCount++;
        }

        // Add edge to graph and clean up
        addEdge(graph, cityAIndex, cityBIndex, cost);
        fgetc(fp);
        if (DEBUG0) printf("\n");
    }

    // Print final graph
    graph->nodeCount = cityCount;
    if (DEBUG1) printGraph(graph);

    // Return final graph
    return graph;
}


struct LinkedElement {
    int val;
    int totalCost;
    struct LinkedElement* next;
};


void SPF(struct Graph* g, int startIndex, int targetIndex) {
    // Initialize variables
    int smallestCosts[MAX_CITIES];
    struct LinkedElement* smallestPaths[MAX_CITIES];
    struct Queue candidates = {0, 0, MAX_CITIES, 0, (malloc(sizeof(struct LinkedElement*) * MAX_CITIES))};
    for (int i = 0; i < g->nodeCount; i++) { smallestCosts[i] = 2147483647; smallestPaths[i] = NULL; }

    // Create initial node
    // - d(s) := 0;
    // - push s into Q;
    struct LinkedElement* startNode = malloc(sizeof(struct LinkedElement));
    startNode->val = startIndex;
    startNode->totalCost = 0;
    startNode->next = NULL;
    queueWrite(&candidates, startNode);
    smallestCosts[startIndex] = 0;
    smallestPaths[startIndex] = startNode;
    printf("\n--------------------------\n\n");
    printf("Finding path from %s to %s\n", cityOrder[startIndex], cityOrder[targetIndex]);
    printf("\n--------------------------\n");

    // Go through candidates
    // - while Q is not empty
    // - - u := poll Q
    while (candidates.count > 0) {
        struct LinkedElement* current = queueRead(&candidates);
        printf("\n\n----------: (%d Candidates)\n\n", candidates.count);
        if (current->next != NULL) {
            printf("Checking from %s(%d)\n", cityOrder[current->val], current->val);
            printf("With path cost %d\n", current->totalCost);
            printf("With parent %s(%d)\n", cityOrder[current->next->val], current->next->val);
        } else printf("Checking from %s(%d)\n", cityOrder[current->val], current->val);

        // Loop through currents neighbours
        // - for each edge (u, v) in E(G)
        struct NodeEdgeAdj* currentEdge = g->nodes[current->val].edgeHead;
        while (currentEdge != NULL) {
            int cost = currentEdge->cost;
            int target = currentEdge->target;
            int newCost = current->totalCost + cost;

            printf("\n-> Checking to %s(%d) : edge = %d, path = %d\n", cityOrder[target], target, cost, newCost);

            // If found better path then update
            // - if d(u) + w(u, v) < d(v)
            if (newCost < smallestCosts[target]) {
                printf("- !!! Found lowest path with cost %d\n", newCost, cost);

                // Check next is not in parent list
                // - This replaces the check if in queue
                // - This works cos yes
                struct LinkedElement* check = current;
                int found = 0;
                while (check->next != NULL) {
                    check = check->next;
                    if (check->val == target) { found = 1; break; }
                }
                if (found) { printf("In path\n"); currentEdge = currentEdge->next; continue; }

                // Create new node in path
                // - d(v) := d(u) + w(u, v)
                // - push v into Q
                struct LinkedElement* newNode = malloc(sizeof(struct LinkedElement));
                newNode->val = target;
                newNode->totalCost = newCost;
                newNode->next = current;
                queueWrite(&candidates, newNode);
                smallestCosts[target] = newCost;
                smallestPaths[target] = newNode;
                printf("- Adding node with %d -> %d\n", target, current->val);
            } else printf("- %d not shorter than %d\n", newCost, smallestCosts[target]);

            // Iterate through edges
            currentEdge = currentEdge->next;
        }
    }

    // Construct path
    struct LinkedElement* smallestPath = smallestPaths[targetIndex];
    printf("\nFound path\nTotal cost = %d\nTraversing backwards:\n", smallestPath->totalCost);
    while (smallestPath->val != startIndex && smallestPath != NULL) {
        printf("%s <- ", cityOrder[smallestPath->val]);
        smallestPath = smallestPath->next;
    }
    printf("%s\n\n", cityOrder[startIndex]);
}


int main() {
    // Parse graph from file
    struct Graph* g = parseGraph("energy-v22-1.txt");

    // Find indices of pairs
    char* cityA = "Manchester";
    char* cityB = "York";
    int cityAIndex, cityBIndex;
    for (cityAIndex = 0; cityAIndex < cityCount && strcmp(cityA, cityOrder[cityAIndex]) != 0; cityAIndex++) { }
    for (cityBIndex = 0; cityBIndex < cityCount && strcmp(cityB, cityOrder[cityBIndex]) != 0; cityBIndex++) { }

    // Pathfind using graph
    SPF(g, cityAIndex, cityBIndex);

    return 0;
}
