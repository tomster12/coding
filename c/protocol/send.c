// flags: -lws2_32

// https://chatgpt.com/share/66e8d085-bfb4-800d-9d53-19af1acfb21f

#include <stdio.h>
#include <winsock2.h>

#define BROADCAST_IP "255.255.255.255"
#define BROADCAST_PORT 5120
#define MAX_SIZE 1024

int printHostInfo()
{
    char hostname[256];
    struct hostent *host_entry;
    char *client_ip;

    if (gethostname(hostname, sizeof(hostname)) == SOCKET_ERROR)
    {
        printf("Error getting hostname.\n");
        return 1;
    }

    host_entry = gethostbyname(hostname);
    if (host_entry == NULL)
    {
        printf("Error getting IP address for hostname.\n");
        return 1;
    }

    client_ip = inet_ntoa(*(struct in_addr *)host_entry->h_addr_list[0]);
    if (client_ip == NULL)
    {
        printf("Error converting IP address.\n");
        return 1;
    }

    printf("Client hostname: %s\n", hostname);
    printf("Client IP Address: %s\n", client_ip);

    return 0;
}

int main(int argc, char *argv[])
{
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
    {
        printf("WSAStartup failed\n");
        return 1;
    }

    if (printHostInfo() != 0)
    {
        printf("Error getting client info.\n");
        WSACleanup();
        return 1;
    }

    // Create a UDP socket
    SOCKET sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (sock == INVALID_SOCKET)
    {
        printf("Error creating socket: %ld\n", WSAGetLastError());
        WSACleanup();
        return 1;
    }

    // Setup broadcast address
    struct sockaddr_in address;
    address.sin_family = AF_INET;
    address.sin_addr.s_addr = inet_addr(BROADCAST_IP);
    address.sin_port = htons(BROADCAST_PORT);

    // Enable broadcast
    BOOL broadcast = TRUE;
    if (setsockopt(sock, SOL_SOCKET, SO_BROADCAST, (char *)&broadcast, sizeof(broadcast)) == SOCKET_ERROR)
    {
        printf("setsockopt failed: %d\n", WSAGetLastError());
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    // Send a broadcast message
    char *message = "Message from client";
    printf("Sending: %s\n", message);
    if (sendto(sock, message, strlen(message), 0, (SOCKADDR *)&address, sizeof(address)) == SOCKET_ERROR)
    {
        printf("sendto failed: %d\n", WSAGetLastError());
        closesocket(sock);
        WSACleanup();
        return 1;
    }

    // Listen for incoming messages
    char response[MAX_SIZE];
    int addressLen = sizeof(address);
    int recvLen = recvfrom(sock, response, MAX_SIZE - 1, 0, (struct sockaddr *)&address, &addressLen);
    if (recvLen > 0)
    {
        response[recvLen] = '\0';
        printf("Received: %s\n", response);
    }
    else
    {
        printf("No response received.\n");
    }

    closesocket(sock);
    WSACleanup();
    return 0;
}
