
using Unity.Netcode;
using UnityEngine;


public class ConnectionManager : MonoBehaviour
{
    void OnGUI()
    {
        // Show UI onscreen for control
        GUILayout.BeginArea(new Rect(10, 10, 300, 300));
        if (!NetworkManager.Singleton.IsClient && !NetworkManager.Singleton.IsServer) SetupUI();
        else IngameUI();
        GUILayout.EndArea();
    }


    void SetupUI()
    {
        // Start host / client / server on button press
        if (GUILayout.Button("Host")) NetworkManager.Singleton.StartHost();
        else if (GUILayout.Button("Client")) NetworkManager.Singleton.StartClient();
        else if (GUILayout.Button("Server")) NetworkManager.Singleton.StartServer();
        else return;
    }


    void IngameUI()
    {
        // Show mode onscreen
        string mode = NetworkManager.Singleton.IsHost ? "Host"
            : NetworkManager.Singleton.IsServer ? "Server" : "Client";
        GUILayout.Label("Transport: " + NetworkManager.Singleton.NetworkConfig.NetworkTransport.GetType().Name);
        GUILayout.Label("Mode: " + mode);
    }
}
