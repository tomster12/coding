#include <stdio.h>
#include <winsock2.h>
#include <windows.h>
#include "listener.h"
#include "app_context.h"

#define LISTEN_PORT 5120
#define MAX_SIZE 1024

DWORD WINAPI listener_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;

    // Setup a UDP socket listening to broadcast messages
    SOCKET serverSocket = socket(AF_INET, SOCK_DGRAM, 0);
    if (serverSocket == INVALID_SOCKET)
    {
        printf("Socket creation failed.\n");
        exit(1);
    }

    // Bind the socket to the broadcast port
    struct sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(LISTEN_PORT);
    if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
    {
        printf("Bind failed.\n");
        closesocket(serverSocket);
        exit(1);
    }

    // Receive and reply to all messages
    struct sockaddr_in clientAddr;
    int clientAddrSize = sizeof(clientAddr);
    char buffer[MAX_SIZE];

    while (1)
    {
        int recvLen = recvfrom(serverSocket, buffer, MAX_SIZE - 1, 0, (struct sockaddr *)&clientAddr, &clientAddrSize);

        if (recvLen <= 0)
        {
            printf("Failed to receive data.\n");
            continue;
        }

        buffer[recvLen] = '\0';

        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            if (ctx->messages_count < MAX_MESSAGES)
            {
                ctx->messages[ctx->messages_count++] = _strdup(buffer);
            }
            ctx->to_update_messages = 1;
            ReleaseMutex(ctx->ui_mutex);
        }
    }

    closesocket(serverSocket);
}
