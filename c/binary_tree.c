#include <stdio.h>
#include <stdlib.h>

typedef struct _Node
{
	int val;
	struct _Node *left;
	struct _Node *right;
} Node;

Node *node_new(int val)
{
	Node *head = malloc(sizeof(Node));
	head->val = val;
	head->left = NULL;
	head->right = NULL;
	return head;
}

void node_add(Node *node, int val)
{
	if (val <= (node->val))
	{
		if ((node->left) == NULL)
		{
			node->left = node_new(val);
		}
		else
		{
			node_add(node->left, val);
		}
	}
	else if (val > (node->val))
	{
		if ((node->right) == NULL)
		{
			node->right = node_new(val);
		}
		else
		{
			node_add(node->right, val);
		}
	}
}

int main(int argc, char **argv)
{
	Node *head = node_new(4);
	node_add(head, 2);
	node_add(head, 1);
	node_add(head, 3);
	node_add(head, 6);
	node_add(head, 5);
	node_add(head, 7);
	printf("base: %d\n", (head->val));
	printf("L: %d\n", (head->left->val));
	printf("R: %d\n", (head->right->val));
	printf("LL: %d\n", (head->left->left->val));
	printf("LR: %d\n", (head->left->right->val));
	printf("RL: %d\n", (head->right->left->val));
	printf("RR: %d\n", (head->right->right->val));
}
