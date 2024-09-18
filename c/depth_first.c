
#include <stdio.h>
#include <stdlib.h>

typedef struct Node_s
{
  int val;
  struct Node_s *left;
  struct Node_s *right;
} Node;
Node *createNode(int val);
void addNode(Node *node, int val);
Node *depthFirstSearch(Node *node, int val);

int main(int argc, char **argv)
{
  Node *head = createNode(4);
  addNode(head, 2);
  addNode(head, 1);
  addNode(head, 3);
  addNode(head, 6);
  addNode(head, 5);
  addNode(head, 7);
  Node *target = depthFirstSearch(head, 5);
}

Node *createNode(int val)
{
  Node *head = malloc(sizeof(Node));
  head->val = val;
  head->left = NULL;
  head->right = NULL;
  return head;
}

void addNode(Node *node, int val)
{
  if (val <= (node->val))
  {
    if ((node->left) == NULL)
    {
      node->left = createNode(val);
    }
    else
    {
      addNode(node->left, val);
    }
  }
  else if (val > (node->val))
  {
    if ((node->right) == NULL)
    {
      node->right = createNode(val);
    }
    else
    {
      addNode(node->right, val);
    }
  }
}

Node *depthFirstSearch(Node *node, int val)
{
  if (node->left != NULL)
  {
    Node *output = depthFirstSearch(node->left, val);
    if (output != NULL)
      return output;
  }

  printf("%d\n", node->val);
  if (node->val == val)
  {
    printf("Found\n");
    return node;
  }
  else if (node->right != NULL)
  {
    Node *output = depthFirstSearch(node->right, val);
    if (output != NULL)
      return output;
  }
  else
  {
    return NULL;
  }
}
