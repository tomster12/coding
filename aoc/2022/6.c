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

    // Grow window through the data tracking the index of each char in tracking_set[]
    // If char position in tracking_set[] is inside window then move window start to next index
    // Note: tracking_set[] uses 1 based indexing for ease of code (0 means not seen yet)

    unsigned short tracking_set[26] = {0};
    unsigned short ptr_a = 0;
    unsigned short ptr_b = 0;

    while (ptr_b < DATA_SIZE && ptr_b - ptr_a < TARGET_LENGTH)
    {
        unsigned short val = data[ptr_b] - 'a';

        if (ptr_a < tracking_set[val])
        {
            ptr_a = tracking_set[val];
        }

        tracking_set[val] = ++ptr_b;
    }

    printf("Result: %d -> %d\n", ptr_a, ptr_b);

    return 0;
}
