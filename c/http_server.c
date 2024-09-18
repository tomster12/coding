// compiler: -lws2_32

#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdio.h>

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
    printf("Listening on port %d\n", port);
    listen(server, 1);

    while (1)
    {
        // Accept an incoming connection
        SOCKET client = accept(server, NULL, NULL);
        printf("Client connected\n");

        // Receive data
        char request[1024];
        printf("Receiving...\n");
        recv(client, request, sizeof(request), 0);
        printf("Received: %s\n", request);

        // Send a response
        char *response = "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<html><body><h1>Hello, world!</h1></body></html>\r\n\r\n";
        send(client, response, strlen(response), 0);
        printf("Sent: %s\n", response);

        // Close client connection
        closesocket(client);
    }

    // Close the socket
    closesocket(server);

    return 0;
}
