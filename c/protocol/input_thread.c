#include <stdio.h>
#include <stdlib.h>
#include "input_thread.h"
#include "app_context.h"

#define BROADCAST_IP "255.255.255.255"
#define BROADCAST_PORT 5120

SOCKET create_broadcast_socket(struct sockaddr_in *address)
{
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == INVALID_SOCKET)
    {
        printf("Error creating socket: %ld\n", WSAGetLastError());
        exit(1);
    }

    address->sin_family = AF_INET;
    address->sin_addr.s_addr = inet_addr(BROADCAST_IP);
    address->sin_port = htons(BROADCAST_PORT);

    BOOL broadcast = TRUE;
    if (setsockopt(sock, SOL_SOCKET, SO_BROADCAST, (char *)&broadcast, sizeof(broadcast)) == SOCKET_ERROR)
    {
        printf("setsockopt failed: %d\n", WSAGetLastError());
        closesocket(sock);
        exit(1);
    }

    return sock;
}

DWORD WINAPI input_thread(LPVOID arg)
{
    struct AppContext *ctx = (struct AppContext *)arg;

    struct sockaddr_in address;
    SOCKET sock = create_broadcast_socket(&address);
    char buffer[MAX_BUFFER];

    while (1)
    {
        // Get user input and remove newline
        fgets(buffer, MAX_BUFFER, stdin);
        buffer[strcspn(buffer, "\n")] = '\0';

        // On empty input just clear
        if (strlen(buffer) == 0)
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->to_clear_input = 1;
            ReleaseMutex(ctx->ui_mutex);
            continue;
        }

        // Handle exit command
        if (strcmp(buffer, "/exit") == 0)
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->to_exit = 1;
            ReleaseMutex(ctx->ui_mutex);
            break;
        }

        // Add message to history
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            if (ctx->messages_count < MAX_MESSAGES)
            {
                ctx->messages[ctx->messages_count++] = _strdup(buffer);
            }
            ctx->to_update_messages = 1;
            ctx->to_clear_input = 1;
            ReleaseMutex(ctx->ui_mutex);
        }

        // Broadcast message on network
        if (sendto(sock, buffer, strlen(buffer), 0, (struct sockaddr *)&address, sizeof(address)) == SOCKET_ERROR)
        {
            printf("sendto failed: %d\n", WSAGetLastError());
            closesocket(sock);
            exit(1);
        }

        buffer[0] = '\0';
    }

    closesocket(sock);
}
