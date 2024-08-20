// gcc ./c/find_git.c -o ./c/find_git
// ./c/find_git.exe "D:/Files/Coding" --sync

#include <windows.h>
#include <stdio.h>
#include <string.h>

#define MAX_FILES 1000

void storeFilePath(char filePaths[MAX_FILES][MAX_PATH], int *count, const char *filePath)
{
    if (*count < MAX_FILES)
    {
        strncpy(filePaths[*count], filePath, MAX_PATH);
        (*count)++;
    }
    else
    {
        printf("Warning: Maximum number of files reached.\n");
    }
}

void searchDirectoriesForGit(const char *basePath, char filePaths[MAX_FILES][MAX_PATH], int *count)
{
    char searchPath[MAX_PATH];
    snprintf(searchPath, MAX_PATH, "%s\\*", basePath);

    // Begin the file find search
    WIN32_FIND_DATA currentFileData;
    HANDLE hCurrentFile = FindFirstFile(searchPath, &currentFileData);

    if (hCurrentFile == INVALID_HANDLE_VALUE)
        return;

    do
    {
        // Skip files
        if (!(currentFileData.dwFileAttributes & FILE_ATTRIBUTE_DIRECTORY))
        {
            continue;
        }

        // Skip "." and ".." directories
        if (strcmp(currentFileData.cFileName, ".") == 0 || strcmp(currentFileData.cFileName, "..") == 0)
        {
            continue;
        }

        // Print the directory name if it contains ".git"
        if (strstr(currentFileData.cFileName, ".git") != NULL)
        {
            storeFilePath(filePaths, count, basePath);
            continue;
        }

        // Skip recursing into specific directories
        if (strstr(currentFileData.cFileName, "node_modules") != NULL || strstr(currentFileData.cFileName, "github") != NULL || strstr(currentFileData.cFileName, "PackageCache") != NULL || strstr(currentFileData.cFileName, "software") != NULL)
        {
            continue;
        }

        // Recurse and look at subdirectories
        char nextSearchPath[MAX_PATH];
        snprintf(nextSearchPath, MAX_PATH, "%s\\%s", basePath, currentFileData.cFileName);
        searchDirectoriesForGit(nextSearchPath, filePaths, count);

    } while (FindNextFile(hCurrentFile, &currentFileData) != 0);

    FindClose(hCurrentFile);
}

int main(int argc, char *argv[])
{
    if (argc < 2 || argc > 3)
    {
        printf("Usage: %s <base_path> <optional_params>\n", argv[0]);
        return 1;
    }

    // Parse param 3
    boolean toSync = FALSE;
    if (argc == 3)
    {
        if (strcmp(argv[2], "--sync") == 0)
        {
            toSync = TRUE;
        }
        else
        {
            printf("Invalid parameter: %s\n", argv[2]);
            return 1;
        }
    }

    // Perform the search for directories containing ".git"
    char filePaths[MAX_FILES][MAX_PATH];
    int count = 0;
    searchDirectoriesForGit(argv[1], filePaths, &count);

    // Loop over found directories
    printf("\nFound %d directories containing .git:\n\n", count);
    for (int i = 0; i < count; i++)
    {
        char *folderPath = filePaths[i];

        // Check if any git changes
        char command[1024];
        snprintf(command, sizeof(command), "cd %s && git diff --quiet", folderPath);
        int result = system(command);
        boolean hasChanges = result != 0;

        // Print out final information
        if (hasChanges)
        {
            printf("\n(*) %s\n", folderPath);
        }
        else
        {
            printf("\n    %s\n", folderPath);
        }

        // Perform sync if specified
        if (toSync)
        {
            snprintf(command, sizeof(command), "cd %s && git add . >nul && git commit -m \"sync\" >nul && git push >nul", folderPath);
            printf("        | Running command '%s'\n", command);
            int result = system(command);
            if (result != 0)
            {
                printf("        | Did not push.\n", folderPath);
            }
            else
            {
                printf("        | Successfully synced.\n", folderPath);
            }
        }
    }

    printf("\n");
    return 0;
}
