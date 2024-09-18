
#include <stdio.h>
#include <stdlib.h>

typedef struct Node_s
{
  int val;
  struct Node_s *next;
} Node;
Node *createNode(int val);
void addNode(Node *head, int val);
int listLength(Node *head);

int main(int argc, char **argv)
{
  Node *head = createNode(7);
  addNode(head, 2);
  addNode(head, 6);

  printf("Num nodes: %d\n", listLength(head));
  int count = 0;
  Node *current = head;
  while (current != NULL)
  {
    printf("Node %d: %d\n", count, current->val);
    current = current->next;
    count++;
  }
}

Node *createNode(int val)
{
  Node *head = malloc(sizeof(Node));
  head->val = val;
  head->next = NULL;
  return head;
}

void addNode(Node *head, int val)
{
  Node *current = head;
  while (current->next != NULL)
  {
    current = current->next;
  }
  current->next = createNode(val);
}

int listLength(Node *head)
{
  if (head->next != NULL)
  {
    return 1 + listLength(head->next);
  }
  else
  {
    return 1;
  }
}
