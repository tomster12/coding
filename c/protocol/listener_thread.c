#include <stdio.h>
#include <winsock2.h>
#include <windows.h>
#include "listener_thread.h"
#include "app_context.h"

#define LISTEN_PORT 5120
#define MAX_SIZE 1024

SOCKET create_listener_socket(struct sockaddr_in *address)
{
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == INVALID_SOCKET)
    {
        printf("Error creating socket: %ld\n", WSAGetLastError());
        exit(1);
    }

    address->sin_family = AF_INET;
    address->sin_addr.s_addr = INADDR_ANY;
    address->sin_port = htons(LISTEN_PORT);

    if (bind(sock, (struct sockaddr *)address, sizeof(*address)) == SOCKET_ERROR)
    {
        printf("Bind failed with error: %d\n", WSAGetLastError());
        closesocket(sock);
        exit(1);
    }

    return sock;
}

DWORD WINAPI listener_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;

    struct sockaddr_in serverAddr;
    SOCKET serverSocket = create_listener_socket(&serverAddr);
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
