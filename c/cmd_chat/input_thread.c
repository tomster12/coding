#include <stdio.h>
#include <stdlib.h>
#include "constants.h"
#include "app_context.h"
#include "input_thread.h"

SOCKET create_broadcast_socket(struct sockaddr_in *address)
{
    address->sin_family = AF_INET;
    address->sin_addr.s_addr = inet_addr(BROADCAST_IP);
    address->sin_port = htons(BROADCAST_PORT);

    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == INVALID_SOCKET)
    {
        printf("Error creating broadcast socket: %ld\n", WSAGetLastError());
        exit(1);
    }

    BOOL broadcast = TRUE;
    if (setsockopt(sock, SOL_SOCKET, SO_BROADCAST, (char *)&broadcast, sizeof(broadcast)) == SOCKET_ERROR)
    {
        printf("Broadcast setsockopt broadcast failed: %d\n", WSAGetLastError());
        closesocket(sock);
        exit(1);
    }

    return sock;
}

DWORD WINAPI input_thread(LPVOID arg)
{
    AppContext *ctx = (AppContext *)arg;

    int exit_code = 0;
    struct sockaddr_in broadcast_addr;
    SOCKET broadcast_sock = create_broadcast_socket(&broadcast_addr);
    char buffer[MAX_MESSAGE_SIZE];

    while (1)
    {
        // Wait for full line of user input
        fgets(buffer, MAX_MESSAGE_SIZE, stdin);
        buffer[strcspn(buffer, "\n")] = '\0';

        // On '' signal to clear input and continue
        if (strlen(buffer) == 0)
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->to_clear_input = 1;
            ReleaseMutex(ctx->ui_mutex);
            continue;
        }
        
        // On '/exit' signal to exit application and finish
        if (strcmp(buffer, "/exit") == 0)
        {
            WaitForSingleObject(ctx->ui_mutex, INFINITE);
            ctx->to_exit = 1;
            ReleaseMutex(ctx->ui_mutex);
            exit_code = 0;
            break;
        }

        // Clear input before sending message
        WaitForSingleObject(ctx->ui_mutex, INFINITE);
        ctx->to_clear_input = 1;
        ReleaseMutex(ctx->ui_mutex);

        // Broadcast message on network
        if (sendto(broadcast_sock, buffer, strlen(buffer), 0, (struct sockaddr *)&broadcast_addr, sizeof(broadcast_addr)) == SOCKET_ERROR)
        {
            printf("sendto failed: %d\n", WSAGetLastError());
            exit_code = 1;
            break;
        }

        buffer[0] = '\0';
    }

    closesocket(broadcast_sock);
    exit(exit_code);
}
