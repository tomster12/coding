#include <stdio.h>
#include <stdlib.h>

typedef struct _Node
{
	int val;
	struct _Node *next;
} Node;

Node *node_new(int val)
{
	Node *head = malloc(sizeof(Node));
	head->val = val;
	head->next = NULL;
	return head;
}

void node_add(Node *head, int val)
{
	Node *current = head;
	while (current->next != NULL)
	{
		current = current->next;
	}
	current->next = node_new(val);
}

int tree_size(Node *head)
{
	if (head->next != NULL)
	{
		return 1 + tree_size(head->next);
	}
	else
	{
		return 1;
	}
}

int main(int argc, char **argv)
{
	Node *head = node_new(7);
	node_add(head, 2);
	node_add(head, 6);

	printf("Num nodes: %d\n", tree_size(head));

	int count = 0;
	Node *current = head;

	while (current != NULL)
	{
		printf("Node %d: %d\n", count, current->val);
		current = current->next;
		count++;
	}
}
