// Minimal HTTP server

#include <stdio.h>
#include <winsock2.h>
#include <ws2tcpip.h>

int main(int argc, char *argv[])
{
    int port = 8080;

    // Initialize Winsock
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    // Create a socket
    SOCKET server = socket(AF_INET, SOCK_STREAM, 0);

    // Bind the socket to an IP address and port
    struct sockaddr_in service;
    service.sin_family = AF_INET;
    service.sin_addr.s_addr = inet_addr("127.0.0.1");
    service.sin_port = htons(port);
    bind(server, (SOCKADDR *)&service, sizeof(service));

    // Listen on the socket
    listen(server, 1);

    // Accept an incoming connection
    SOCKET client = accept(server, NULL, NULL);

    // Send and receive data
    char request[1024];
    recv(client, request, sizeof(request), 0);
    printf("%s", request);

    return 0;
}
