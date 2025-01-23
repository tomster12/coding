// build: -lws2_32

#include <stdio.h>
#include <winsock2.h>

#define LISTEN_PORT 5120
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

int main()
{
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
    {
        printf("WSAStartup failed.\n");
        return 1;
    }

    if (printHostInfo() != 0)
    {
        printf("Error getting client info.\n");
        WSACleanup();
        return 1;
    }

    // Setup a UDP socket listening to broadcast messages
    SOCKET serverSocket = socket(AF_INET, SOCK_DGRAM, 0);
    if (serverSocket == INVALID_SOCKET)
    {
        printf("Socket creation failed.\n");
        WSACleanup();
        return 1;
    }

    struct sockaddr_in serverAddr;
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(LISTEN_PORT);

    if (bind(serverSocket, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) == SOCKET_ERROR)
    {
        printf("Bind failed.\n");
        closesocket(serverSocket);
        WSACleanup();
        return 1;
    }

    printf("Listening to broadcast on port %d...\n", LISTEN_PORT);

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
        printf("Received message: %s\n", buffer);
        char *response = "Message received!";
        printf("Sending response: %s\n", response);
        sendto(serverSocket, response, strlen(response), 0, (struct sockaddr *)&clientAddr, clientAddrSize);
    }

    closesocket(serverSocket);
    WSACleanup();
    return 0;
}
