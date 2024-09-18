
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

int main(int argc, char **argv)
{
  Node *head = createNode(4);
  addNode(head, 2);
  addNode(head, 1);
  addNode(head, 3);
  addNode(head, 6);
  addNode(head, 5);
  addNode(head, 7);
  printf("00: %d\n", (head->val));
  printf("00: %d\n", (head->left->val));
  printf("01: %d\n", (head->right->val));
  printf("000: %d\n", (head->left->left->val));
  printf("001: %d\n", (head->left->right->val));
  printf("010: %d\n", (head->right->left->val));
  printf("011: %d\n", (head->right->right->val));
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
