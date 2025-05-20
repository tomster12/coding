#include <stdio.h>
#include <winsock2.h>
#include <windows.h>
#include "constants.h"
#include "listener_thread.h"
#include "app_context.h"

SOCKET create_listener_socket(struct sockaddr_in *address)
{
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);

    if (sock == INVALID_SOCKET)
    {
        printf("Error creating listener socket: %ld\n", WSAGetLastError());
        exit(1);
    }

    address->sin_family = AF_INET;
    address->sin_addr.s_addr = INADDR_ANY;
    address->sin_port = htons(LISTEN_PORT);

    BOOL reuse = TRUE;
    if (setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, (char *)&reuse, sizeof(reuse)) == SOCKET_ERROR)
    {
        printf("Broadcast setsockopt reuse failed: %d\n", WSAGetLastError());
        closesocket(sock);
        exit(1);
    }

    if (bind(sock, (struct sockaddr *)address, sizeof(*address)) == SOCKET_ERROR)
    {
        printf("Listener bind failed with error: %d\n", WSAGetLastError());
        closesocket(sock);
        exit(1);
    }

    return sock;
}

DWORD WINAPI listener_thread(LPVOID arg)
{
    AppContext *ctx = (AppContext *)arg;

    struct sockaddr_in server_addr;
    struct sockaddr_in client_addr;
    SOCKET server_sock = create_listener_socket(&server_addr);
    int client_addr_size = sizeof(client_addr);
    char buffer[MAX_SIZE];

    while (1)
    {
        int recv_len = recvfrom(server_sock, buffer, MAX_SIZE - 1, 0, (struct sockaddr *)&client_addr, &client_addr_size);

        if (recv_len <= 0)
        {
            printf("Failed to receive data.\n");
            continue;
        }

        buffer[recv_len] = '\0';

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

    closesocket(server_sock);
}
