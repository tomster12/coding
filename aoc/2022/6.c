#include <stdio.h>
#include <stdlib.h>

#define DATA_SIZE 4096
#define TARGET_LENGTH 14

int main(int argc, char const *argv[])
{
    // Read in all the data in 1 chunk into data[]

    char data[DATA_SIZE] = {0};

    FILE *file = fopen("data.txt", "r");

    if (file == NULL)
    {
        printf("Error opening file\n");
        exit(1);
    }

    fgets(data, DATA_SIZE, file);
    fclose(file);

    // Move window end ptr_b through the data tracking the index of each char in prev_ptrs[]
    // If char already in prev_ptrs[] inside window then update window start ptr_a to next index

    int prev_ptrs[26];
    int ptr_a = 0;
    int ptr_b = 0;

    for (int i = 0; i < 26; i++)
    {
        prev_ptrs[i] = -1;
    }

    while (ptr_b < DATA_SIZE && ptr_b - ptr_a < TARGET_LENGTH)
    {
        int val = data[ptr_b] - 'a';

        if (ptr_a < prev_ptrs[val])
        {
            ptr_a = prev_ptrs[val] + 1;
        }

        prev_ptrs[val] = ptr_b++;
    }

    printf("Result: %d -> %d\n", ptr_a, ptr_b);

    return 0;
}
